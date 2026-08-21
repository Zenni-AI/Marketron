/**
 * Transcription is out of scope for the v1 slice (job-site before/after
 * footage rarely carries load-bearing narration, and the spec's first build
 * task doesn't require it) but the planner is written against this interface
 * so a real ASR-backed implementation (e.g. Whisper) can be dropped in later
 * without touching the planning prompt/call site.
 */
export interface Transcriber {
  transcribe(absoluteVideoPath: string): Promise<string | null>;
}

export class NoopTranscriber implements Transcriber {
  async transcribe(): Promise<string | null> {
    return null;
  }
}
