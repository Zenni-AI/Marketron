import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { beforeAfterHookTemplate, type EditPlan } from "@marketron/core";
import ffmpegPkg from "ffmpeg-static";
import ffprobePkg from "ffprobe-static";
import { FORMAT_DIMENSIONS, renderEditPlan, type AssetForRender } from "./render";

const execFileAsync = promisify(execFile);
const ffmpegPath = ffmpegPkg as string;
const ffprobePath = (ffprobePkg as { path: string }).path;

let storageRoot: string;
let outDir: string;

async function makeSyntheticVideo(outPath: string) {
  await execFileAsync(ffmpegPath, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "testsrc=size=640x480:rate=30",
    "-t",
    "2",
    "-pix_fmt",
    "yuv420p",
    outPath,
  ]);
}

async function makeSyntheticPhoto(outPath: string, color: string) {
  await execFileAsync(ffmpegPath, [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=${color}:s=640x480`,
    "-frames:v",
    "1",
    outPath,
  ]);
}

async function probeDimensions(filePath: string): Promise<{ width: number; height: number }> {
  const { stdout } = await execFileAsync(ffprobePath, [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "json",
    filePath,
  ]);
  const parsed = JSON.parse(stdout);
  return parsed.streams[0];
}

describe("renderEditPlan", () => {
  beforeAll(async () => {
    storageRoot = await fs.mkdtemp(path.join(os.tmpdir(), "marketron-storage-"));
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), "marketron-out-"));

    await makeSyntheticVideo(path.join(storageRoot, "hook.mp4"));
    await makeSyntheticPhoto(path.join(storageRoot, "before.jpg"), "red");
    await makeSyntheticPhoto(path.join(storageRoot, "after.jpg"), "green");
    await makeSyntheticPhoto(path.join(storageRoot, "detail.jpg"), "yellow");
    await makeSyntheticPhoto(path.join(storageRoot, "closer.jpg"), "purple");
    await makeSyntheticPhoto(path.join(storageRoot, "logo.png"), "blue");
  }, 60_000);

  afterAll(async () => {
    await fs.rm(storageRoot, { recursive: true, force: true });
    await fs.rm(outDir, { recursive: true, force: true });
  });

  it("renders a fixture edit plan to all 3 formats at the correct dimensions", async () => {
    // A somewhat richer fixture than the bare minimum: several photo clips
    // (each should get its own Ken-Burns pan/zoom variant, see
    // EditPlanComposition's KEN_BURNS_VARIANTS) chained with the template's
    // default "slide" transition (see registry.ts), plus captions spread
    // across the whole runtime rather than clustered at the start — this
    // exercises the same code paths a real, longer plan would.
    const editPlan: EditPlan = {
      jobId: "job_fixture",
      templateId: beforeAfterHookTemplate.id,
      clips: [
        { assetId: "hook", order: 0, inSec: 0, outSec: 1.5, role: "hook" },
        { assetId: "before", order: 1, inSec: 0, outSec: 1.5, role: "before" },
        { assetId: "after", order: 2, inSec: 0, outSec: 1.5, role: "after" },
        { assetId: "detail", order: 3, inSec: 0, outSec: 1.5, role: "body" },
        { assetId: "closer", order: 4, inSec: 0, outSec: 1.5, role: "body" },
      ],
      captions: [
        { text: "Before -> After", startSec: 1.5, endSec: 3 },
        { text: "Every detail matters", startSec: 4.5, endSec: 6 },
        { text: "Book your job today", startSec: 6, endSec: 7.5 },
      ],
      totalDurationSec: 7.5,
      rationale: "Fixture plan for automated renderer verification.",
    };

    const assets: AssetForRender[] = [
      { assetId: "hook", kind: "video", relativePath: "hook.mp4" },
      { assetId: "before", kind: "photo", relativePath: "before.jpg" },
      { assetId: "after", kind: "photo", relativePath: "after.jpg" },
      { assetId: "detail", kind: "photo", relativePath: "detail.jpg" },
      { assetId: "closer", kind: "photo", relativePath: "closer.jpg" },
    ];

    const results = await renderEditPlan({
      editPlan,
      template: beforeAfterHookTemplate,
      assets,
      storageRoot,
      logoAbsolutePath: path.join(storageRoot, "logo.png"),
      outDir,
    });

    expect(results).toHaveLength(3);

    for (const result of results) {
      const stat = await fs.stat(result.outputPath);
      expect(stat.size).toBeGreaterThan(0);

      const dims = await probeDimensions(result.outputPath);
      expect(dims).toEqual(FORMAT_DIMENSIONS[result.format]);
    }
  }, 150_000);
});
