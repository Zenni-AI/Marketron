import type Anthropic from "@anthropic-ai/sdk";
import type { PlannerInput } from "./planner";

/**
 * Hand-written JSON schema (rather than derived from the zod EditPlanSchema)
 * for the Anthropic tool-use call that forces Claude's response into our
 * structured shape. Kept in sync with @marketron/core's EditPlanSchema by
 * hand since the two shapes are small and stable.
 */
export function editPlanTool(input: PlannerInput): Anthropic.Tool {
  return {
    name: "submit_edit_plan",
    description: "Submit the final structured edit plan for this job.",
    input_schema: {
      type: "object",
      properties: {
        templateId: {
          type: "string",
          enum: input.availableTemplates.map((t) => t.id),
          description: "Which template this plan uses.",
        },
        clips: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              assetId: {
                type: "string",
                description: "Must be one of the provided asset ids.",
              },
              order: { type: "integer", minimum: 0 },
              inSec: { type: "number", minimum: 0 },
              outSec: { type: "number", exclusiveMinimum: 0 },
              role: {
                type: "string",
                enum: ["hook", "before", "after", "body"],
              },
            },
            required: ["assetId", "order", "inSec", "outSec"],
          },
        },
        captions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string", minLength: 1 },
              startSec: { type: "number", minimum: 0 },
              endSec: { type: "number", exclusiveMinimum: 0 },
            },
            required: ["text", "startSec", "endSec"],
          },
        },
        totalDurationSec: { type: "number", exclusiveMinimum: 0 },
        rationale: {
          type: "string",
          description: "One or two sentences on why you made these editorial choices.",
        },
      },
      required: ["templateId", "clips", "totalDurationSec"],
    },
  };
}
