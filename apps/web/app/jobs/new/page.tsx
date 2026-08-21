"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewJobPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
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

      if (files && files.length > 0) {
        const formData = new FormData();
        for (const file of Array.from(files)) formData.append("files", file);
        const uploadRes = await fetch(`/api/jobs/${job.id}/assets`, {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error((await uploadRes.json()).error ?? "Upload failed");
      }

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
        Upload this job&apos;s raw clips and before/after photos. You&apos;ll generate the AI edit
        plan and render it on the next screen.
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

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="job-files" style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            Clips & photos
          </label>
          <input
            id="job-files"
            type="file"
            multiple
            accept="video/*,image/*"
            onChange={(e) => setFiles(e.target.files)}
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
