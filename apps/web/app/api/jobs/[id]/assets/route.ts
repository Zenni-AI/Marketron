import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { linkAssetsToJob, saveUploadedFilesToLibrary } from "@/lib/assets";
import { serializeAsset } from "@/lib/serialize";

/**
 * Uploads new files AND attaches them to this job in one call. The files
 * land in the shared library first (see lib/assets.ts) — they aren't
 * job-exclusive, so they can be reused on a future job without
 * re-uploading. To attach existing library assets instead of uploading new
 * ones, see POST /api/jobs/[id]/assets/link.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return NextResponse.json(
      { error: 'No files provided (expected a multipart "files" field).' },
      { status: 400 },
    );
  }

  const createdAssets = await saveUploadedFilesToLibrary(files);
  if (createdAssets.length === 0) {
    return NextResponse.json(
      { error: "None of the uploaded files were a recognized video/* or image/* type." },
      { status: 400 },
    );
  }

  await linkAssetsToJob(
    jobId,
    createdAssets.map((a) => a.id),
  );

  if (job.status === "draft") {
    await db.job.update({ where: { id: jobId }, data: { status: "uploading" } });
  }

  return NextResponse.json({ assets: createdAssets.map(serializeAsset) }, { status: 201 });
}
