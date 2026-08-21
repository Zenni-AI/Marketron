"use client";

import { useCallback, useEffect, useState } from "react";

interface RenderDto {
  id: string;
  format: "9x16" | "1x1" | "16x9";
  filePath: string | null;
  reviewStatus: string;
}

interface QueueEntry {
  job: { id: string; name: string; status: string };
  renders: RenderDto[];
}

const REVIEW_ACTIONS: { label: string; value: string; className: string }[] = [
  { label: "Approve", value: "approved", className: "button success" },
  { label: "Re-edit", value: "reedit", className: "button secondary" },
  { label: "Discard", value: "discarded", className: "button danger" },
];

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueEntry[] | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/queue");
    if (res.ok) setQueue((await res.json()).queue);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function review(renderId: string, reviewStatus: string) {
    setPending(renderId);
    try {
      await fetch(`/api/renders/${renderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewStatus }),
      });
      await load();
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="container">
      <h1>Review queue</h1>
      <p className="subtitle">Every rendered format, grouped by job. Approve, re-edit, or discard.</p>

      {queue === null && <p className="subtitle">Loading…</p>}
      {queue?.length === 0 && <p className="subtitle">Nothing rendered yet.</p>}

      {queue?.map((entry) => (
        <section key={entry.job.id} className="card">
          <h2>{entry.job.name}</h2>
          <div className="render-grid">
            {entry.renders.map((render) => (
              <div key={render.id}>
                {render.filePath && <video controls src={`/api/media/${render.filePath}`} />}
                <p style={{ fontSize: 13, margin: "6px 0" }}>
                  {render.format} · <span className="badge">{render.reviewStatus}</span>
                </p>
                <div className="actions">
                  {REVIEW_ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      className={action.className}
                      disabled={pending === render.id}
                      onClick={() => review(render.id, action.value)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
