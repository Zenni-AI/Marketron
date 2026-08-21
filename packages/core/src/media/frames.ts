import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import ffmpegPkg from "ffmpeg-static";

const execFileAsync = promisify(execFile);
const ffmpegPath: string = (ffmpegPkg as unknown as string) ?? "ffmpeg";

/**
 * Extracts a handful of representative JPEG frames from a video, spread
 * across its duration. Used to give the (image-only) planning model a proxy
 * for "seeing" the clip, since it can't ingest raw video directly.
 */
export async function extractFrames(
  absoluteVideoPath: string,
  durationSec: number,
  outDir: string,
  count = 3,
): Promise<string[]> {
  await fs.mkdir(outDir, { recursive: true });
  const outputs: string[] = [];
  for (let i = 0; i < count; i++) {
    const timestampSec = (durationSec * (i + 1)) / (count + 1);
    const outPath = path.join(outDir, `frame-${i}.jpg`);
    await execFileAsync(ffmpegPath, [
      "-y",
      "-ss",
      timestampSec.toFixed(2),
      "-i",
      absoluteVideoPath,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      outPath,
    ]);
    outputs.push(outPath);
  }
  return outputs;
}
