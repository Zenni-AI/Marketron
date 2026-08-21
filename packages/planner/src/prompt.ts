import type { PlannerInput } from "./planner";

export const SYSTEM_PROMPT = `You are an expert short-form video editor for local service businesses \
(contractors, landscapers, cleaners, etc.) turning raw job-site photos and video clips into a single \
polished, branded ad/organic video. You make every editorial decision yourself — clip selection, \
ordering, before/after pairing, hook choice, caption text and timing. You never see the raw video \
directly, only representative frames sampled across each clip plus its metadata, so choose \
conservatively when a clip's quality is ambiguous.

Rules:
- Pick exactly one template from the provided list and honor its maxClips limit.
- Prefer opening on the single strongest "hook" moment — the most visually striking frame/clip.
- If before/after photo pairs are present (same subject, clearly different states), pair and order
  them adjacently so the contrast reads clearly.
- Only reference asset ids that were actually provided to you.
- For video clips, inSec/outSec must fall within the clip's stated duration.
- For photo assets, inSec must be 0 and outSec is the hold duration you choose (typically 1.5-3s).
- Keep the total video short and punchy: aim for roughly 8-20 seconds total.
- Captions should be short, punchy, on-brand phrases (not full sentences), each timed to a specific
  window within the total duration — not every clip needs a caption.
- Call the submit_edit_plan tool exactly once with your final plan. Do not respond with plain text.`;

export function buildIntroPrompt(input: PlannerInput): string {
  const templateLines = input.availableTemplates
    .map(
      (t) =>
        `- id: "${t.id}", name: "${t.name}", maxClips: ${t.maxClips}, hookDurationSec: ${t.hookDurationSec}, description: ${t.description}`,
    )
    .join("\n");

  const assetLines = input.assets
    .map(({ asset }) => {
      if (asset.kind === "photo") {
        return `- ${asset.id}: photo, "${asset.originalName}"`;
      }
      return `- ${asset.id}: video, "${asset.originalName}", duration ${
        asset.durationSec?.toFixed(1) ?? "unknown"
      }s`;
    })
    .join("\n");

  return `Job ${input.jobId} — plan a single edit from these raw assets.

Available templates:
${templateLines}

Assets in this job:
${assetLines}

Below, each asset is introduced by a text label followed by its image(s): the photo itself for photo \
assets, or several frames sampled evenly across the clip for video assets. Use these to judge sharpness, \
composition, and whether photos form a before/after pair.`;
}
