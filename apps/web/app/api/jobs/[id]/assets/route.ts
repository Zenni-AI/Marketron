import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { probeMedia } from "@marketron/core";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { serializeAsset } from "@/lib/serialize";

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

  const created = [];
  for (const file of files) {
    const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "photo" : null;
    if (!kind) continue; // unsupported file type — skip rather than fail the whole batch

    const assetId = randomUUID();
    const ext = path.extname(file.name) || (kind === "video" ? ".mp4" : ".jpg");
    const relativePath = `uploads/${jobId}/${assetId}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await storage.save(relativePath, buffer);

    let durationSec: number | undefined;
    let width: number | undefined;
    let height: number | undefined;
    if (kind === "video") {
      const probe = await probeMedia(storage.absolutePath(relativePath));
      durationSec = probe.durationSec;
      width = probe.width;
      height = probe.height;
    }

    const asset = await db.asset.create({
      data: {
        id: assetId,
        jobId,
        kind,
        filePath: relativePath,
        originalName: file.name,
        mimeType: file.type,
        durationSec,
        width,
        height,
      },
    });
    created.push(serializeAsset(asset));
  }

  if (created.length === 0) {
    return NextResponse.json(
      { error: "None of the uploaded files were a recognized video/* or image/* type." },
      { status: 400 },
    );
  }

  if (job.status === "draft") {
    await db.job.update({ where: { id: jobId }, data: { status: "uploading" } });
  }

  return NextResponse.json({ assets: created }, { status: 201 });
}
