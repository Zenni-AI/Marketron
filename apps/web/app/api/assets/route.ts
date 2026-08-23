import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeAsset } from "@/lib/serialize";

/**
 * Lists every asset in the shared library, newest first. This is the
 * catalog a user picks from when composing a job out of clips/photos
 * they've uploaded before (see POST /api/jobs/[id]/assets/link).
 */
export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind");
  const where = kind === "video" || kind === "photo" ? { kind } : {};

  const assets = await db.asset.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ assets: assets.map(serializeAsset) });
}
