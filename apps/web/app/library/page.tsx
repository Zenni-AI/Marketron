"use client";

import { useEffect, useState } from "react";

interface AssetDto {
  id: string;
  kind: "video" | "photo";
  filePath: string;
  originalName: string;
  createdAt: string;
}

export default function LibraryPage() {
  const [assets, setAssets] = useState<AssetDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assets")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load library.");
        return res.json();
      })
      .then((body) => setAssets(body.assets))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load library."));
  }, []);

  return (
    <main className="container">
      <h1>Library</h1>
      <p className="subtitle">
        Every clip and photo you&apos;ve ever uploaded, in one place. Pick from these when composing a
        job instead of re-uploading.
      </p>

      {error && <p className="error">{error}</p>}

      {!assets ? (
        <p className="subtitle">Loading…</p>
      ) : assets.length === 0 ? (
        <p className="subtitle">No assets yet. Upload some from a job page to start building your library.</p>
      ) : (
        <div className="asset-grid">
          {assets.map((asset) => (
            <div key={asset.id}>
              <div className="asset-thumb">
                {asset.kind === "photo" ? (
                  <img src={`/api/media/${asset.filePath}`} alt={asset.originalName} />
                ) : (
                  <video src={`/api/media/${asset.filePath}`} muted />
                )}
              </div>
              <p style={{ fontSize: 12, marginTop: 4, wordBreak: "break-word" }}>{asset.originalName}</p>
              <p style={{ fontSize: 11, color: "var(--muted)" }}>
                {new Date(asset.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
