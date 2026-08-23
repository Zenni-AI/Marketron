import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getJobAssets } from "@/lib/assets";
import { serializeAsset, serializeEditPlan, serializeJob, serializeRender } from "@/lib/serialize";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await db.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const [assets, editPlans, renders] = await Promise.all([
    getJobAssets(id),
    db.editPlan.findMany({ where: { jobId: id }, orderBy: { createdAt: "desc" } }),
    db.render.findMany({ where: { jobId: id }, orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({
    job: serializeJob(job),
    assets: assets.map(serializeAsset),
    editPlans: editPlans.map(serializeEditPlan),
    renders: renders.map(serializeRender),
  });
}
