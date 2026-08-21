/**
 * Storage abstraction so uploads/renders can move from local disk to S3 (or
 * anything else) later as a config change, not a rewrite. Every path in the
 * rest of the system is relative to a Storage root — never an absolute
 * filesystem path — so it stays portable across backends.
 */
export interface Storage {
  save(relativePath: string, data: Buffer): Promise<string>;
  readFile(relativePath: string): Promise<Buffer>;
  /** Absolute path on disk for a relative path. Local-disk-specific, but
   * useful for handing files to Node tooling (ffmpeg, Remotion) that needs a
   * real path rather than a stream. */
  absolutePath(relativePath: string): string;
  exists(relativePath: string): Promise<boolean>;
  root(): string;
}
