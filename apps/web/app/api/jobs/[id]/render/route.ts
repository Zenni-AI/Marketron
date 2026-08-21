import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { EditPlanSchema, getTemplate } from "@marketron/core";
import { renderEditPlan, type AssetForRender } from "@marketron/renderer";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { getBrandLogoAbsolutePath } from "@/lib/branding";
import { serializeRender } from "@/lib/serialize";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const body = await request.json().catch(() => ({}));

  const editPlanRow =
    typeof body.editPlanId === "string"
      ? await db.editPlan.findUnique({ where: { id: body.editPlanId } })
      : await db.editPlan.findFirst({ where: { jobId }, orderBy: { createdAt: "desc" } });

  if (!editPlanRow || editPlanRow.jobId !== jobId) {
    return NextResponse.json(
      { error: "No edit plan found for this job. Generate one first." },
      { status: 400 },
    );
  }

  const editPlan = EditPlanSchema.parse(JSON.parse(editPlanRow.planJson));
  const template = getTemplate(editPlan.templateId);
  if (!template) {
    return NextResponse.json({ error: `Unknown template "${editPlan.templateId}".` }, { status: 500 });
  }

  const assets = await db.asset.findMany({ where: { jobId } });
  const assetsForRender: AssetForRender[] = assets.map((asset) => ({
    assetId: asset.id,
    kind: asset.kind as "video" | "photo",
    relativePath: asset.filePath,
  }));

  await db.job.update({ where: { id: jobId }, data: { status: "rendering" } });

  const outDir = storage.absolutePath(`renders/${jobId}/${editPlanRow.id}`);

  try {
    const results = await renderEditPlan({
      editPlan,
      template,
      assets: assetsForRender,
      storageRoot: storage.root(),
      logoAbsolutePath: getBrandLogoAbsolutePath(),
      outDir,
    });

    const renders = [];
    for (const result of results) {
      const relativeOutput = path.relative(storage.root(), result.outputPath);
      const row = await db.render.create({
        data: {
          jobId,
          editPlanId: editPlanRow.id,
          format: result.format,
          filePath: relativeOutput,
          status: "done",
          reviewStatus: "pending",
        },
      });
      renders.push(serializeRender(row));
    }

    await db.job.update({ where: { id: jobId }, data: { status: "ready" } });
    return NextResponse.json({ renders }, { status: 201 });
  } catch (err) {
    await db.job.update({ where: { id: jobId }, data: { status: "uploading" } }).catch(() => {});
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Rendering failed." },
      { status: 502 },
    );
  }
}
