"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";

interface AssetDto {
  id: string;
  kind: "video" | "photo";
  filePath: string;
  originalName: string;
  durationSec?: number;
}

interface EditPlanDto {
  id: string;
  templateId: string;
  createdAt: string;
  plan: {
    clips: { assetId: string; order: number; inSec: number; outSec: number; role?: string }[];
    captions: { text: string; startSec: number; endSec: number }[];
    totalDurationSec: number;
    rationale?: string;
  };
}

interface RenderDto {
  id: string;
  format: "9x16" | "1x1" | "16x9";
  filePath: string | null;
  status: string;
  reviewStatus: string;
}

interface JobDetail {
  job: { id: string; name: string; status: string };
  assets: AssetDto[];
  editPlans: EditPlanDto[];
  renders: RenderDto[];
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<JobDetail | null>(null);
  const [busy, setBusy] = useState<"plan" | "render" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [library, setLibrary] = useState<AssetDto[] | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [linking, setLinking] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/jobs/${id}`);
    if (res.ok) setData(await res.json());
  }, [id]);

  const loadLibrary = useCallback(async () => {
    const res = await fetch("/api/assets");
    if (res.ok) {
      const body = await res.json();
      setLibrary(body.assets);
    } else {
      setLibraryError("Failed to load library.");
    }
  }, []);

  useEffect(() => {
    load();
    loadLibrary();
  }, [load, loadLibrary]);

  const jobAssetIds = useMemo(() => new Set(data?.assets.map((a) => a.id) ?? []), [data]);
  const pickableLibrary = useMemo(
    () => (library ?? []).filter((asset) => !jobAssetIds.has(asset.id)),
    [library, jobAssetIds],
  );

  function toggleSelected(assetId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  }

  async function addSelected() {
    if (selectedIds.size === 0) return;
    setLinking(true);
    setLibraryError(null);
    try {
      const res = await fetch(`/api/jobs/${id}/assets/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: [...selectedIds] }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to add assets.");
      setSelectedIds(new Set());
      await load();
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : "Failed to add assets.");
    } finally {
      setLinking(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setLibraryError(null);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) formData.append("files", file);
      const res = await fetch(`/api/jobs/${id}/assets`, { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed.");
      await Promise.all([load(), loadLibrary()]);
    } catch (err) {
      setLibraryError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function generatePlan() {
    setBusy("plan");
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${id}/plan`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Planning failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Planning failed.");
    } finally {
      setBusy(null);
    }
  }

  async function renderNow(editPlanId: string) {
    setBusy("render");
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${id}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editPlanId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Rendering failed.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rendering failed.");
    } finally {
      setBusy(null);
    }
  }

  if (!data) {
    return (
      <main className="container">
        <p className="subtitle">Loading…</p>
      </main>
    );
  }

  const { job, assets, editPlans, renders } = data;
  const latestPlan = editPlans[0];

  return (
    <main className="container">
      <h1>{job.name}</h1>
      <p className="subtitle">
        <span className="badge">{job.status}</span>
      </p>

      <section className="card">
        <h2>Add assets</h2>

        {library !== null && (
          <>
            <p className="subtitle" style={{ marginBottom: 12 }}>
              Pick from your library ({pickableLibrary.length} available), or upload something new.
            </p>
            {pickableLibrary.length === 0 ? (
              <p className="subtitle">
                Nothing else in your library yet — everything you&apos;ve uploaded is already on this job.
              </p>
            ) : (
              <div className="asset-grid">
                {pickableLibrary.map((asset) => {
                  const checked = selectedIds.has(asset.id);
                  return (
                    <label
                      key={asset.id}
                      className="asset-thumb"
                      style={{ position: "relative", cursor: "pointer", border: checked ? "2px solid var(--accent)" : undefined }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelected(asset.id)}
                        style={{ position: "absolute", top: 6, left: 6, width: 18, height: 18, zIndex: 1 }}
                      />
                      {asset.kind === "photo" ? (
                        <img src={`/api/media/${asset.filePath}`} alt={asset.originalName} />
                      ) : (
                        <video src={`/api/media/${asset.filePath}`} muted />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            <div className="actions">
              <button
                className="button"
                onClick={addSelected}
                disabled={selectedIds.size === 0 || linking}
              >
                {linking ? "Adding…" : `Add selected (${selectedIds.size})`}
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: 20 }}>
          <label htmlFor="job-files" style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            Or upload new clips & photos
          </label>
          <input
            id="job-files"
            type="file"
            multiple
            accept="video/*,image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading && <p className="subtitle" style={{ marginTop: 6 }}>Uploading…</p>}
        </div>

        {libraryError && <p className="error">{libraryError}</p>}
      </section>

      <section className="card">
        <h2>Assets ({assets.length})</h2>
        <div className="asset-grid">
          {assets.map((asset) => (
            <div key={asset.id} className="asset-thumb">
              {asset.kind === "photo" ? (
                <img src={`/api/media/${asset.filePath}`} alt={asset.originalName} />
              ) : (
                <video src={`/api/media/${asset.filePath}`} muted />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Edit plan</h2>
        {!latestPlan ? (
          <p className="subtitle">No edit plan yet. Claude will pick the clips, order, captions, and pairing.</p>
        ) : (
          <div>
            <p style={{ marginBottom: 8 }}>
              Template: <strong>{latestPlan.templateId}</strong> · {latestPlan.plan.totalDurationSec.toFixed(1)}s ·{" "}
              {latestPlan.plan.clips.length} clips
            </p>
            {latestPlan.plan.rationale && (
              <p className="subtitle" style={{ marginBottom: 8 }}>
                &ldquo;{latestPlan.plan.rationale}&rdquo;
              </p>
            )}
          </div>
        )}
        <div className="actions">
          <button className="button" onClick={generatePlan} disabled={busy !== null || assets.length === 0}>
            {busy === "plan" ? "Generating…" : latestPlan ? "Regenerate edit plan" : "Generate edit plan"}
          </button>
          {latestPlan && (
            <button
              className="button secondary"
              onClick={() => renderNow(latestPlan.id)}
              disabled={busy !== null}
            >
              {busy === "render" ? "Rendering…" : "Render (9:16, 1:1, 16:9)"}
            </button>
          )}
        </div>
        {error && <p className="error">{error}</p>}
      </section>

      {renders.length > 0 && (
        <section className="card">
          <h2>Renders</h2>
          <div className="render-grid">
            {renders.map((render) => (
              <div key={render.id}>
                {render.filePath && (
                  <video controls src={`/api/media/${render.filePath}`} />
                )}
                <p style={{ fontSize: 13, marginTop: 6 }}>
                  {render.format} · <span className="badge">{render.reviewStatus}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="subtitle">Approve, request a re-edit, or discard each render from the review queue.</p>
        </section>
      )}
    </main>
  );
}
