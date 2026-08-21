import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeJob } from "@/lib/serialize";

export async function GET() {
  const jobs = await db.job.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ jobs: jobs.map(serializeJob) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const name =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : `Job ${new Date().toLocaleString()}`;

  const job = await db.job.create({ data: { name, status: "draft" } });
  return NextResponse.json({ job: serializeJob(job) }, { status: 201 });
}
