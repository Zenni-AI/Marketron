import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffprobePkg from "ffprobe-static";

const execFileAsync = promisify(execFile);
const ffprobePath: string = ffprobePkg.path;

export interface MediaProbeResult {
  durationSec?: number;
  width?: number;
  height?: number;
}

/** Probes a video file's duration/dimensions via ffprobe. Returns {} if the
 * file can't be probed (e.g. not actually a video) rather than throwing, so
 * callers can treat probing as best-effort metadata. */
export async function probeMedia(absoluteFilePath: string): Promise<MediaProbeResult> {
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      absoluteFilePath,
    ]);
    const parsed = JSON.parse(stdout);
    const stream = parsed.streams?.[0];
    const duration = parsed.format?.duration ? Number(parsed.format.duration) : undefined;
    return {
      durationSec: duration && Number.isFinite(duration) ? duration : undefined,
      width: stream?.width,
      height: stream?.height,
    };
  } catch {
    return {};
  }
}
