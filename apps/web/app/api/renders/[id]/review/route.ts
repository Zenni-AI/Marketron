import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeRender } from "@/lib/serialize";

const VALID_STATUSES = new Set(["pending", "approved", "reedit", "discarded"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const reviewStatus = body.reviewStatus;

  if (typeof reviewStatus !== "string" || !VALID_STATUSES.has(reviewStatus)) {
    return NextResponse.json(
      { error: `reviewStatus must be one of: ${[...VALID_STATUSES].join(", ")}` },
      { status: 400 },
    );
  }

  const render = await db.render.update({ where: { id }, data: { reviewStatus } }).catch(() => null);
  if (!render) {
    return NextResponse.json({ error: "Render not found." }, { status: 404 });
  }

  return NextResponse.json({ render: serializeRender(render) });
}
