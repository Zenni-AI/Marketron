# Marketron

Raw job footage and photos in → AI picks the best moments → auto-edits into a
finished video → renders in every required size/format → lands in a review
queue for approval. Zero manual editing required.

This repo currently implements the **first build slice**: upload one job's
clips/photos, generate one AI edit plan, render it to 9:16 / 1:1 / 16:9, and
review it in a simple queue. See [ARCHITECTURE.md](./ARCHITECTURE.md) for how
this is meant to grow into the full bulk-ingestion pipeline.

## Stack

- **apps/web** — Next.js (App Router) app: upload UI, review queue, API routes.
- **packages/core** — shared types/schemas (zod), the data-driven template
  registry, local-disk storage, Prisma/SQLite DB client, media probing.
- **packages/planner** — the planning layer. Calls the real Claude API to make
  every editorial decision (clip selection/order, before/after pairing, hook
  choice, captions, logo placement) and returns a structured, validated
  `EditPlan`. This is the *only* place that reasons about content.
- **packages/renderer** — the execution layer. A Remotion project that
  deterministically renders whatever `EditPlan` it's given, in every required
  aspect ratio, from one canonical plan.

## Setup

```bash
pnpm install
cp .env.example .env   # then also copy the relevant values into the two
                        # locations below — see "Environment files" below
pnpm db:generate
pnpm db:push
```

### Environment files

Two `.env` files are needed (see `.env.example` for the full list):

- `packages/core/.env` — needs `DATABASE_URL` (use an **absolute** path to
  the sqlite file, e.g. `file:/abs/path/to/repo/packages/core/prisma/dev.db`
  — see the comment in `.env.example` for why).
- `apps/web/.env.local` — needs `DATABASE_URL` (same value as above),
  `ANTHROPIC_API_KEY`, and optionally `ANTHROPIC_MODEL` /
  `REMOTION_BROWSER_EXECUTABLE`.

`ANTHROPIC_API_KEY` is required for the planning step (`POST
/api/jobs/:id/plan`) — there is no mock fallback, since the whole point is
that Claude makes the real editorial decisions. Rendering, review, and
everything else works without it.

### Try it without real footage

```bash
pnpm seed:sample   # creates one demo job with synthetic clips/photos + a
                    # placeholder brand logo, so you can exercise the full
                    # upload -> plan -> render -> review loop immediately
pnpm dev            # http://localhost:3000
```

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Run the Next.js app |
| `pnpm build` | Production build of the web app |
| `pnpm test` | Run all package tests (renderer's test does a real end-to-end render) |
| `pnpm typecheck` | Typecheck every package |
| `pnpm seed:sample` | Create a demo job with synthetic assets |

## Out of scope for this slice

Bulk ingestion (500+ files, folder-per-job grouping), scripting/TTS/
teleprompter, and auto-posting integrations are explicitly out of scope — see
[ARCHITECTURE.md](./ARCHITECTURE.md).
