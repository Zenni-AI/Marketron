import { z } from "zod";

export const AssetKindSchema = z.enum(["video", "photo"]);
export type AssetKind = z.infer<typeof AssetKindSchema>;

/**
 * A single uploaded video or photo living in the shared library — not owned
 * by any one job. `filePath` is always relative to the configured Storage
 * root (never an absolute filesystem path), so assets remain portable
 * across storage backends (local disk today, S3 later). Jobs reference a
 * subset of the library via JobAssetSchema, so the same clip/photo can be
 * reused across multiple jobs without re-uploading.
 */
export const AssetSchema = z.object({
  id: z.string(),
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

/** Which library assets a given job is currently using. */
export const JobAssetSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  assetId: z.string(),
  addedAt: z.string(),
});
export type JobAsset = z.infer<typeof JobAssetSchema>;
