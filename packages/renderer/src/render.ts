import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { EditPlan, Template } from "@marketron/core";
import { startAssetServer } from "./assetServer";
import type { EditPlanCompositionProps, ResolvedClip } from "./compositions/EditPlanComposition";

export type RenderFormat = "9x16" | "1x1" | "16x9";

/**
 * One canonical edit plan, rendered to every required aspect ratio as a
 * final pass — never a separate pipeline per platform.
 */
export const FORMAT_DIMENSIONS: Record<RenderFormat, { width: number; height: number }> = {
  "9x16": { width: 1080, height: 1920 },
  "1x1": { width: 1080, height: 1080 },
  "16x9": { width: 1920, height: 1080 },
};

const FPS = 30;
// Deliberately not overriding ffmpeg/ffprobe: Remotion resolves its own
// compositor + ffmpeg/ffprobe (via the @remotion/compositor-* optional
// dependency), and `binariesDirectory` replaces ALL of those, not just
// ffmpeg — pointing it at a directory missing the compositor/ffprobe
// binaries breaks rendering entirely. Only the browser executable is
// overridden (see REMOTION_BROWSER_EXECUTABLE), since this sandbox already
// has one pre-installed.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cachedBundleUrl: Promise<string> | undefined;
function getBundleUrl(): Promise<string> {
  if (!cachedBundleUrl) {
    cachedBundleUrl = bundle({
      entryPoint: path.join(__dirname, "index.entry.tsx"),
      onProgress: () => {},
    });
  }
  return cachedBundleUrl;
}

export interface AssetForRender {
  assetId: string;
  kind: "video" | "photo";
  /** Path relative to storageRoot. */
  relativePath: string;
}

export interface RenderJobParams {
  editPlan: EditPlan;
  template: Template;
  assets: AssetForRender[];
  /** Absolute path to the local disk storage root the assets live under. */
  storageRoot: string;
  /** Absolute path to a branding logo image on disk, if any. */
  logoAbsolutePath?: string;
  /** Absolute directory path to write the rendered mp4s into. */
  outDir: string;
  formats?: RenderFormat[];
}

export interface RenderResult {
  format: RenderFormat;
  outputPath: string;
}

export async function renderEditPlan(params: RenderJobParams): Promise<RenderResult[]> {
  const formats = params.formats ?? (Object.keys(FORMAT_DIMENSIONS) as RenderFormat[]);
  const assetById = new Map(params.assets.map((a) => [a.assetId, a]));

  await fs.mkdir(params.outDir, { recursive: true });

  const assetServer = await startAssetServer(params.storageRoot);
  let logoServer: Awaited<ReturnType<typeof startAssetServer>> | undefined;
  try {
    const resolvedClips: ResolvedClip[] = params.editPlan.clips.map((clip) => {
      const asset = assetById.get(clip.assetId);
      if (!asset) {
        throw new Error(`Edit plan references asset ${clip.assetId}, which was not provided to the renderer.`);
      }
      return {
        assetId: clip.assetId,
        kind: asset.kind,
        url: `${assetServer.url}/${asset.relativePath}`,
        order: clip.order,
        inSec: clip.inSec,
        outSec: clip.outSec,
        role: clip.role,
      };
    });

    let logoUrl: string | undefined;
    if (params.logoAbsolutePath) {
      logoServer = await startAssetServer(path.dirname(params.logoAbsolutePath));
      logoUrl = `${logoServer.url}/${path.basename(params.logoAbsolutePath)}`;
    }

    const inputProps: EditPlanCompositionProps = {
      resolvedClips,
      captions: params.editPlan.captions,
      template: params.template,
      logoUrl,
      fps: FPS,
      totalDurationSec: params.editPlan.totalDurationSec,
    };

    const bundleUrl = await getBundleUrl();
    const composition = await selectComposition({
      serveUrl: bundleUrl,
      id: "EditPlan",
      inputProps,
      browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE || undefined,
    });

    const results: RenderResult[] = [];
    for (const format of formats) {
      const { width, height } = FORMAT_DIMENSIONS[format];
      const outputLocation = path.join(params.outDir, `${format}.mp4`);
      await renderMedia({
        composition: { ...composition, width, height },
        serveUrl: bundleUrl,
        codec: "h264",
        outputLocation,
        inputProps,
        browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE || undefined,
      });
      results.push({ format, outputPath: outputLocation });
    }

    return results;
  } finally {
    await assetServer.close();
    if (logoServer) await logoServer.close();
  }
}
