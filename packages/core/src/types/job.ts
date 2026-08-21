import { z } from "zod";

export const JobStatusSchema = z.enum([
  "draft",
  "uploading",
  "planning",
  "rendering",
  "ready",
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const JobSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: JobStatusSchema,
  createdAt: z.string(),
});
export type Job = z.infer<typeof JobSchema>;

export const RenderFormatSchema = z.enum(["9x16", "1x1", "16x9"]);
export type RenderFormat = z.infer<typeof RenderFormatSchema>;

export const ReviewStatusSchema = z.enum([
  "pending",
  "approved",
  "reedit",
  "discarded",
]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const RenderStatusSchema = z.enum(["pending", "rendering", "done", "failed"]);
export type RenderStatus = z.infer<typeof RenderStatusSchema>;

export const RenderSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  editPlanId: z.string(),
  format: RenderFormatSchema,
  filePath: z.string().nullable(),
  status: RenderStatusSchema,
  reviewStatus: ReviewStatusSchema,
  createdAt: z.string(),
});
export type Render = z.infer<typeof RenderSchema>;
