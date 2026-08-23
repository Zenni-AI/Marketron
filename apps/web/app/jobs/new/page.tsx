"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewJobPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const jobRes = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!jobRes.ok) throw new Error((await jobRes.json()).error ?? "Failed to create job");
      const { job } = await jobRes.json();

      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="container">
      <h1>New job</h1>
      <p className="subtitle">
        Give the job a name, then add clips and photos on the next screen — either picked from your
        library or freshly uploaded.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="job-name" style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            Job name
          </label>
          <input
            id="job-name"
            type="text"
            placeholder="e.g. Smith backyard patio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Creating…" : "Create job"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  );
}
