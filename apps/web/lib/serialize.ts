import type { Job, Asset, EditPlan as EditPlanRow, Render } from "@prisma/client";
import { EditPlanSchema } from "@marketron/core";

export function serializeJob(job: Job) {
  return {
    id: job.id,
    name: job.name,
    status: job.status,
    createdAt: job.createdAt.toISOString(),
  };
}

export function serializeAsset(asset: Asset) {
  return {
    id: asset.id,
    kind: asset.kind as "video" | "photo",
    filePath: asset.filePath,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    durationSec: asset.durationSec ?? undefined,
    width: asset.width ?? undefined,
    height: asset.height ?? undefined,
    createdAt: asset.createdAt.toISOString(),
  };
}

export function serializeEditPlan(row: EditPlanRow) {
  return {
    id: row.id,
    jobId: row.jobId,
    templateId: row.templateId,
    plan: EditPlanSchema.parse(JSON.parse(row.planJson)),
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeRender(row: Render) {
  return {
    id: row.id,
    jobId: row.jobId,
    editPlanId: row.editPlanId,
    format: row.format,
    filePath: row.filePath,
    status: row.status,
    reviewStatus: row.reviewStatus,
    createdAt: row.createdAt.toISOString(),
  };
}
