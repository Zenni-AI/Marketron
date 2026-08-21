import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Serves uploaded assets and rendered outputs from local disk storage. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const relativePath = segments.join("/");

  let absolutePath: string;
  try {
    absolutePath = storage.absolutePath(relativePath);
  } catch {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  let data: Buffer;
  try {
    data = await fs.readFile(absolutePath);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ext = path.extname(absolutePath).toLowerCase();
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}
