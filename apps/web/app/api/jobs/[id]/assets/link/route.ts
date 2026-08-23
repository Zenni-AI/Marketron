import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getJobAssets, linkAssetsToJob } from "@/lib/assets";
import { serializeAsset } from "@/lib/serialize";

/**
 * Attaches existing library assets (picked from GET /api/assets) to this
 * job — no upload involved. To upload new files and attach them in one
 * call, see POST /api/jobs/[id]/assets instead.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const assetIds = body?.assetIds;
  if (!Array.isArray(assetIds) || assetIds.length === 0 || !assetIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "assetIds must be a non-empty array of strings." }, { status: 400 });
  }

  await linkAssetsToJob(jobId, assetIds);

  if (job.status === "draft") {
    await db.job.update({ where: { id: jobId }, data: { status: "uploading" } });
  }

  const assets = await getJobAssets(jobId);
  return NextResponse.json({ assets: assets.map(serializeAsset) });
}
