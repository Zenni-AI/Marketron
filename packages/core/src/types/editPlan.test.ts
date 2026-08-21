import { describe, expect, it } from "vitest";
import { EditPlanSchema } from "./editPlan";
import { beforeAfterHookTemplate } from "../templates/registry";

describe("EditPlanSchema", () => {
  it("round-trips a valid before/after hook plan", () => {
    const plan = {
      jobId: "job_123",
      templateId: beforeAfterHookTemplate.id,
      clips: [
        { assetId: "asset_hook", order: 0, inSec: 0, outSec: 2, role: "hook" as const },
        { assetId: "asset_before", order: 1, inSec: 0, outSec: 3, role: "before" as const },
        { assetId: "asset_after", order: 2, inSec: 0, outSec: 3, role: "after" as const },
      ],
      captions: [{ text: "Before", startSec: 2, endSec: 5 }],
      totalDurationSec: 8,
      rationale: "Leads with the sharpest wide shot, then contrasts before/after.",
    };

    const parsed = EditPlanSchema.parse(plan);
    expect(parsed.clips).toHaveLength(3);
    expect(parsed.totalDurationSec).toBe(8);
  });

  it("rejects a plan with no clips", () => {
    expect(() =>
      EditPlanSchema.parse({
        jobId: "job_123",
        templateId: beforeAfterHookTemplate.id,
        clips: [],
        captions: [],
        totalDurationSec: 1,
      }),
    ).toThrow();
  });
});
