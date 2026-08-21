import { z } from "zod";

export const AssetKindSchema = z.enum(["video", "photo"]);
export type AssetKind = z.infer<typeof AssetKindSchema>;

/**
 * A single uploaded file belonging to a Job. `filePath` is always relative to
 * the configured Storage root (never an absolute filesystem path), so assets
 * remain portable across storage backends (local disk today, S3 later).
 */
export const AssetSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  kind: AssetKindSchema,
  filePath: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  durationSec: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  /**
   * Reserved for the future "don't reprocess already-analyzed jobs" cache
   * (content hash of the asset -> cached analysis result). Unused in the v1
   * slice, but present so ingestion can grow into it without a schema change.
   */
  analysisHash: z.string().nullish(),
  createdAt: z.string(),
});
export type Asset = z.infer<typeof AssetSchema>;
