import { z } from "zod";

/**
 * The output of the planning layer (see @marketron/planner). This is the one
 * canonical, structured plan the renderer executes deterministically — every
 * format is a final rendering pass over this same JSON, never a separate
 * per-platform pipeline.
 */
export const ClipRoleSchema = z.enum(["hook", "before", "after", "body"]);
export type ClipRole = z.infer<typeof ClipRoleSchema>;

export const PlannedClipSchema = z.object({
  assetId: z.string(),
  order: z.number().int().nonnegative(),
  /**
   * On-screen duration is always (outSec - inSec). For video assets this
   * trims the source between inSec and outSec. For photo assets inSec is
   * always 0 and outSec is simply how long (seconds) to hold the photo —
   * there's nothing to trim, so it's reused as a duration rather than a
   * true "out point in the source."
   */
  inSec: z.number().nonnegative(),
  outSec: z.number().positive(),
  role: ClipRoleSchema.optional(),
});
export type PlannedClip = z.infer<typeof PlannedClipSchema>;

export const PlannedCaptionSchema = z.object({
  text: z.string().min(1),
  startSec: z.number().nonnegative(),
  endSec: z.number().positive(),
});
export type PlannedCaption = z.infer<typeof PlannedCaptionSchema>;

export const EditPlanSchema = z.object({
  jobId: z.string(),
  templateId: z.string(),
  clips: z.array(PlannedClipSchema).min(1),
  captions: z.array(PlannedCaptionSchema).default([]),
  totalDurationSec: z.number().positive(),
  /** Brief note from the model on why it made these editorial choices. */
  rationale: z.string().optional(),
});
export type EditPlan = z.infer<typeof EditPlanSchema>;
