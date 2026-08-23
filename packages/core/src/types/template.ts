import { z } from "zod";

/**
 * Data-driven template skeleton. Adding a new template is adding a registry
 * entry (see ../templates/registry.ts) — never a change to render code.
 */
export const CaptionStyleSchema = z.object({
  fontFamily: z.string(),
  /** Font size as a percentage of frame height, so it scales across formats. */
  fontSizePct: z.number(),
  color: z.string(),
  backgroundColor: z.string().optional(),
  position: z.enum(["top", "center", "bottom"]),
});
export type CaptionStyle = z.infer<typeof CaptionStyleSchema>;

export const TransitionTypeSchema = z.enum(["cut", "fade", "slide"]);
export type TransitionType = z.infer<typeof TransitionTypeSchema>;

export const TransitionSchema = z.object({
  type: TransitionTypeSchema,
  durationSec: z.number(),
});
export type Transition = z.infer<typeof TransitionSchema>;

export const LogoPositionSchema = z.enum([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
]);
export type LogoPosition = z.infer<typeof LogoPositionSchema>;

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  /** Upper bound on how many clips the plan should use with this template. */
  maxClips: z.number(),
  captionStyle: CaptionStyleSchema,
  logoPosition: LogoPositionSchema,
  /** Logo width as a percentage of frame width. */
  logoSizePct: z.number(),
  defaultTransition: TransitionSchema,
  /** How long (seconds) the opening hook clip/photo should hold before cutting on. */
  hookDurationSec: z.number(),
});
export type Template = z.infer<typeof TemplateSchema>;
