import { NextRequest, NextResponse } from "next/server";
import { listTemplates } from "@marketron/core";
import { ClaudePlanner } from "@marketron/planner";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { getJobAssets } from "@/lib/assets";
import { serializeEditPlan } from "@/lib/serialize";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const assets = await getJobAssets(jobId);
  if (assets.length === 0) {
    return NextResponse.json({ error: "Job has no uploaded assets yet." }, { status: 400 });
  }

  let planner: ClaudePlanner;
  try {
    planner = new ClaudePlanner();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  await db.job.update({ where: { id: jobId }, data: { status: "planning" } });

  try {
    const editPlan = await planner.generateEditPlan({
      jobId,
      assets: assets.map((asset) => ({
        asset: {
          id: asset.id,
          kind: asset.kind as "video" | "photo",
          filePath: asset.filePath,
          originalName: asset.originalName,
          mimeType: asset.mimeType,
          durationSec: asset.durationSec ?? undefined,
          width: asset.width ?? undefined,
          height: asset.height ?? undefined,
          createdAt: asset.createdAt.toISOString(),
        },
        absolutePath: storage.absolutePath(asset.filePath),
      })),
      availableTemplates: listTemplates(),
    });

    const row = await db.editPlan.create({
      data: {
        jobId,
        templateId: editPlan.templateId,
        planJson: JSON.stringify(editPlan),
      },
    });

    return NextResponse.json({ editPlan: serializeEditPlan(row) }, { status: 201 });
  } catch (err) {
    // Leave the job's status as "planning" is misleading on failure — reset it.
    await db.job.update({ where: { id: jobId }, data: { status: "uploading" } }).catch(() => {});
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Planning failed." },
      { status: 502 },
    );
  }
}
