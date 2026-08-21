import type { Asset, EditPlan, Template } from "@marketron/core";

export interface PlannerAssetInput {
  asset: Asset;
  /** Absolute filesystem path to the asset file, so the planner can read
   * bytes for the vision call (photos directly, video via extracted frames). */
  absolutePath: string;
}

export interface PlannerInput {
  jobId: string;
  assets: PlannerAssetInput[];
  /** Templates the plan is allowed to choose from. v1 only registers one. */
  availableTemplates: Template[];
}

/**
 * The planning layer: LLM reasoning over assets/transcripts/template
 * constraints, producing a structured EditPlan JSON. This is intentionally
 * the ONLY place that makes editorial decisions — the renderer
 * (@marketron/renderer) is purely deterministic and just executes whatever
 * plan comes out of here.
 */
export interface Planner {
  generateEditPlan(input: PlannerInput): Promise<EditPlan>;
}
