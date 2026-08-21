import Link from "next/link";
import { db } from "@/lib/db";
import { serializeJob } from "@/lib/serialize";

// Without this, Next would happily prerender this page at build time (it has
// no dynamic API calls to force it otherwise) and freeze the job list —
// jobs created after the build would never show up.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jobs = (await db.job.findMany({ orderBy: { createdAt: "desc" }, take: 20 })).map(serializeJob);

  return (
    <main className="container">
      <h1>Jobs</h1>
      <p className="subtitle">
        Upload a job&apos;s raw clips and photos, generate an AI edit plan, and render it to every
        required ad format.
      </p>

      <Link href="/jobs/new" className="button">
        + New job
      </Link>

      <div style={{ marginTop: 24 }}>
        {jobs.length === 0 && <p className="subtitle">No jobs yet.</p>}
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="card" style={{ display: "block" }}>
            <strong>{job.name}</strong>
            <div style={{ marginTop: 6 }}>
              <span className="badge">{job.status}</span>
              <span style={{ marginLeft: 8, color: "var(--muted)", fontSize: 13 }}>
                {new Date(job.createdAt).toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
