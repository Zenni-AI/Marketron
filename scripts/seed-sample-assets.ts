/**
 * Creates one demo Job with synthetic clips/photos (no real footage needed)
 * plus a placeholder brand logo, so the full upload -> plan -> render ->
 * review loop can be exercised end-to-end via the UI without needing real
 * job-site footage on hand. Run with `pnpm seed:sample`.
 *
 * Writes directly to the DB/storage (bypassing the HTTP API) so it works
 * without the web app running.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
// @ts-expect-error - no bundled types
import ffmpegPkg from "ffmpeg-static";
import { getDefaultStorage, getPrisma, probeMedia } from "@marketron/core";

// This script is invoked from the repo root (`pnpm seed:sample`), but
// DATABASE_URL only lives in packages/core/.env. ESM hoists all the imports
// above (none of which construct a PrismaClient at import time — see
// getPrisma() in @marketron/core, which is lazy for exactly this reason),
// so loading the env file here, before main() calls getPrisma(), is enough.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(path.join(__dirname, "../packages/core/.env"));

const execFileAsync = promisify(execFile);
const ffmpegPath = ffmpegPkg as string;

async function makeVideo(outPath: string) {
  await execFileAsync(ffmpegPath, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "testsrc=size=1280x720:rate=30",
    "-t",
    "4",
    "-pix_fmt",
    "yuv420p",
    outPath,
  ]);
}

async function makePhoto(outPath: string, color: string, label: string) {
  await execFileAsync(ffmpegPath, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${color}:s=1280x960`,
    "-vf",
    `drawtext=text='${label}':fontcolor=white:fontsize=96:x=(w-text_w)/2:y=(h-text_h)/2`,
    "-frames:v",
    "1",
    outPath,
  ]).catch(async () => {
    // drawtext needs a font file to be found; fall back to a plain color card
    // if fontconfig isn't available in this environment.
    await execFileAsync(ffmpegPath, [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `color=c=${color}:s=1280x960`,
      "-frames:v",
      "1",
      outPath,
    ]);
  });
}

async function main() {
  const storage = getDefaultStorage();
  const db = getPrisma();

  // Placeholder brand logo (v1 has no per-user branding upload flow yet).
  const logoTmp = `/tmp/marketron-logo-${randomUUID()}.png`;
  await execFileAsync(ffmpegPath, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "color=c=0x2f6fed:s=300x300",
    "-frames:v",
    "1",
    logoTmp,
  ]);
  await storage.save("branding/logo.png", await fs.readFile(logoTmp));
  await fs.rm(logoTmp, { force: true });
  console.log("Wrote placeholder brand logo to storage/branding/logo.png");

  const job = await db.job.create({ data: { name: "Sample: Backyard Patio Install", status: "uploading" } });
  console.log(`Created job ${job.id}`);

  const tmpDir = `/tmp/marketron-seed-${randomUUID()}`;
  await fs.mkdir(tmpDir, { recursive: true });

  const hookTmp = `${tmpDir}/hook.mp4`;
  const beforeTmp = `${tmpDir}/before.jpg`;
  const afterTmp = `${tmpDir}/after.jpg`;
  await Promise.all([
    makeVideo(hookTmp),
    makePhoto(beforeTmp, "0x8a6d3b", "BEFORE"),
    makePhoto(afterTmp, "0x3ba86d", "AFTER"),
  ]);

  const files: { tmpPath: string; kind: "video" | "photo"; originalName: string; mimeType: string }[] = [
    { tmpPath: hookTmp, kind: "video", originalName: "job-site-walkthrough.mp4", mimeType: "video/mp4" },
    { tmpPath: beforeTmp, kind: "photo", originalName: "patio-before.jpg", mimeType: "image/jpeg" },
    { tmpPath: afterTmp, kind: "photo", originalName: "patio-after.jpg", mimeType: "image/jpeg" },
  ];

  for (const file of files) {
    const assetId = randomUUID();
    const ext = file.kind === "video" ? ".mp4" : ".jpg";
    const relativePath = `uploads/${job.id}/${assetId}${ext}`;
    await storage.save(relativePath, await fs.readFile(file.tmpPath));

    let durationSec: number | undefined;
    let width: number | undefined;
    let height: number | undefined;
    if (file.kind === "video") {
      const probe = await probeMedia(storage.absolutePath(relativePath));
      durationSec = probe.durationSec;
      width = probe.width;
      height = probe.height;
    }

    await db.asset.create({
      data: {
        id: assetId,
        jobId: job.id,
        kind: file.kind,
        filePath: relativePath,
        originalName: file.originalName,
        mimeType: file.mimeType,
        durationSec,
        width,
        height,
      },
    });
    console.log(`  + ${file.kind} asset ${assetId} (${file.originalName})`);
  }

  await fs.rm(tmpDir, { recursive: true, force: true });

  console.log(`\nDone. Open the job at /jobs/${job.id} once the web app is running:`);
  console.log(`  pnpm dev   (then visit http://localhost:3000/jobs/${job.id})`);
  console.log(
    "\nGenerating the edit plan requires ANTHROPIC_API_KEY to be set — see .env.example.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
