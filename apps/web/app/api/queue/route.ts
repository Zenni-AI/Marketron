import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeJob, serializeRender } from "@/lib/serialize";
import type { Render } from "@prisma/client";

export async function GET() {
  const [jobs, renders] = await Promise.all([
    db.job.findMany({ orderBy: { createdAt: "desc" } }),
    db.render.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const rendersByJob = new Map<string, Render[]>();
  for (const render of renders) {
    const list = rendersByJob.get(render.jobId) ?? [];
    list.push(render);
    rendersByJob.set(render.jobId, list);
  }

  const queue = jobs
    .filter((job) => (rendersByJob.get(job.id)?.length ?? 0) > 0)
    .map((job) => ({
      job: serializeJob(job),
      renders: (rendersByJob.get(job.id) ?? []).map(serializeRender),
    }));

  return NextResponse.json({ queue });
}
