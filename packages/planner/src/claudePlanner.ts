import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { EditPlanSchema, extractFrames, type EditPlan } from "@marketron/core";
import type { Planner, PlannerInput } from "./planner";
import { NoopTranscriber, type Transcriber } from "./transcriber";
import { SYSTEM_PROMPT, buildIntroPrompt } from "./prompt";
import { editPlanTool } from "./editPlanTool";

const FRAMES_PER_CLIP = 3;

type AllowedImageMimeType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
const ALLOWED_IMAGE_MIME_TYPES: ReadonlySet<AllowedImageMimeType> = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: AllowedImageMimeType; data: string } };

export interface ClaudePlannerOptions {
  apiKey?: string;
  model?: string;
  transcriber?: Transcriber;
}

/**
 * Real Claude-backed planner. Requires ANTHROPIC_API_KEY — this is the
 * component that makes the actual editorial decisions; nothing downstream
 * (the renderer) reasons about content, it only executes this plan.
 */
export class ClaudePlanner implements Planner {
  private readonly client: Anthropic;
  private readonly model: string;
  private readonly transcriber: Transcriber;

  constructor(options: ClaudePlannerOptions = {}) {
    const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. The planning layer calls the real Claude API to make " +
          "editorial decisions and has no mock fallback — set it in your environment (see .env.example).",
      );
    }
    this.client = new Anthropic({ apiKey });
    this.model = options.model ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";
    this.transcriber = options.transcriber ?? new NoopTranscriber();
  }

  async generateEditPlan(input: PlannerInput): Promise<EditPlan> {
    if (input.assets.length === 0) {
      throw new Error("Cannot generate an edit plan for a job with no assets.");
    }

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "marketron-frames-"));
    let content: ContentBlock[];
    try {
      content = await this.buildContentBlocks(input, tmpDir);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [editPlanTool(input)],
      tool_choice: { type: "tool", name: "submit_edit_plan" },
      messages: [{ role: "user", content }],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolUse) {
      throw new Error("Claude did not return a structured edit plan (no tool_use block in response).");
    }

    return EditPlanSchema.parse({
      ...(toolUse.input as object),
      jobId: input.jobId,
    });
  }

  private async buildContentBlocks(input: PlannerInput, tmpDir: string): Promise<ContentBlock[]> {
    const content: ContentBlock[] = [{ type: "text", text: buildIntroPrompt(input) }];

    for (const { asset, absolutePath } of input.assets) {
      if (asset.kind === "photo") {
        content.push({ type: "text", text: `Asset ${asset.id} (photo, "${asset.originalName}"):` });
        content.push(await imageBlockFromFile(absolutePath, asset.mimeType));
        continue;
      }

      const duration = asset.durationSec ?? 4;
      const transcript = await this.transcriber.transcribe(absolutePath);
      const frames = await extractFrames(
        absolutePath,
        duration,
        path.join(tmpDir, asset.id),
        FRAMES_PER_CLIP,
      );
      content.push({
        type: "text",
        text:
          `Asset ${asset.id} (video, "${asset.originalName}", duration ${duration.toFixed(1)}s)` +
          (transcript ? `, transcript: "${transcript}"` : ", no audio transcript") +
          `. ${frames.length} frames sampled evenly across the clip:`,
      });
      for (const framePath of frames) {
        content.push(await imageBlockFromFile(framePath, "image/jpeg"));
      }
    }

    return content;
  }
}

function isAllowedImageMimeType(value: string): value is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as ReadonlySet<string>).has(value);
}

async function imageBlockFromFile(absolutePath: string, mimeType: string): Promise<ContentBlock> {
  const data = await fs.readFile(absolutePath);
  const media_type = isAllowedImageMimeType(mimeType) ? mimeType : "image/jpeg";
  return { type: "image", source: { type: "base64", media_type, data: data.toString("base64") } };
}
