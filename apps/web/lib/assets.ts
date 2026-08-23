import { randomUUID } from "node:crypto";
import path from "node:path";
import { probeMedia } from "@marketron/core";
import type { Asset } from "@prisma/client";
import { db } from "./db";
import { storage } from "./storage";

/**
 * Saves uploaded files into the shared library (not tied to any job — see
 * ARCHITECTURE.md). Non-video/image files are silently skipped rather than
 * failing the whole batch. Callers that want the new assets attached to a
 * job should follow up with `linkAssetsToJob`.
 */
export async function saveUploadedFilesToLibrary(files: File[]): Promise<Asset[]> {
  const created: Asset[] = [];

  for (const file of files) {
    const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "photo" : null;
    if (!kind) continue;

    const assetId = randomUUID();
    const ext = path.extname(file.name) || (kind === "video" ? ".mp4" : ".jpg");
    const relativePath = `uploads/${assetId}${ext}`;
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
        kind,
        filePath: relativePath,
        originalName: file.name,
        mimeType: file.type,
        durationSec,
        width,
        height,
      },
    });
    created.push(asset);
  }

  return created;
}

/** All library assets currently attached to a job, oldest-added first. */
export async function getJobAssets(jobId: string): Promise<Asset[]> {
  const jobAssets = await db.jobAsset.findMany({
    where: { jobId },
    orderBy: { addedAt: "asc" },
    include: { asset: true },
  });
  return jobAssets.map((ja) => ja.asset);
}

/** Attaches existing library assets to a job. Idempotent — re-linking an
 * asset that's already on the job is a no-op. (SQLite's Prisma connector
 * doesn't support `createMany({ skipDuplicates: true })`, so duplicates are
 * filtered out up front instead.) */
export async function linkAssetsToJob(jobId: string, assetIds: string[]): Promise<void> {
  const uniqueIds = [...new Set(assetIds)];
  if (uniqueIds.length === 0) return;

  const existing = await db.jobAsset.findMany({
    where: { jobId, assetId: { in: uniqueIds } },
    select: { assetId: true },
  });
  const alreadyLinked = new Set(existing.map((e) => e.assetId));
  const toLink = uniqueIds.filter((id) => !alreadyLinked.has(id));
  if (toLink.length === 0) return;

  await db.jobAsset.createMany({
    data: toLink.map((assetId) => ({ jobId, assetId })),
  });
}
