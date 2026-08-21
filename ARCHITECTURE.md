# Architecture

## The split that matters

Planning (reasoning about content) and rendering (producing video) are
separate packages that never blur together:

- **`@marketron/planner`** — a single Claude API call per job. Given a job's
  assets (photos + a few sampled frames per video clip, plus duration/
  resolution metadata) and the available template registry, it returns a
  structured `EditPlan` (clip order/in-out points, before/after pairing, hook
  choice, caption text/timing, template selection), validated against a zod
  schema. This is the *only* place that makes editorial judgment calls.
- **`@marketron/renderer`** — deterministic. Given an `EditPlan` + `Template`
  + resolved asset paths, it executes the plan with Remotion: no model ever
  touches video directly.

This mirrors the spec's own architecture note: separate the planning step
(LLM reasoning → structured JSON) from the rendering step (deterministic code
executing that JSON), and never let a model manipulate video directly.

## One canonical plan, many formats

`EditPlan` has no notion of aspect ratio. `renderEditPlan()` bundles the
Remotion composition once, then calls `renderMedia()` three times — for
1080×1920 (9:16), 1080×1080 (1:1), and 1920×1080 (16:9) — against the exact
same `inputProps`. Format is a final rendering pass over one plan, not a
separate pipeline per platform. Caption/logo positions are defined as
percentages in the template, so they hold up across aspect ratios without
per-format logic.

Adding a Meta/Google ads-specific variant later means adding an entry to
`FORMAT_DIMENSIONS` in `packages/renderer/src/render.ts` — not a new
pipeline.

## Templates are data

`packages/core/src/templates/registry.ts` holds `Template` objects: caption
style/position, logo position/size, transition type, hook duration. The
renderer reads every visual decision from the `Template` it's given — it has
no hardcoded look. v1 ships one template (`before-after-hook`); adding a
second is a registry entry, not a renderer change. The planner picks a
template by id from whatever's in the registry, so the set of templates the
AI can choose from also grows without code changes to the planner.

## Why a real Claude call, not a mock

The planning layer is built directly against the Anthropic SDK
(`@anthropic-ai/sdk`), with tool-use forcing a structured response that gets
validated against the `EditPlan` zod schema before anything downstream sees
it. There's no rule-based fallback — `ClaudePlanner`'s constructor throws a
clear error if `ANTHROPIC_API_KEY` isn't set, rather than silently degrading
to a fake planner. The renderer's own automated test (which *does* need to
run without any API key) uses a hand-written fixture `EditPlan`, not a mock
planner — it's testing the renderer, not standing in for the AI.

### How the planner "sees" video

Claude has no way to ingest a raw video stream directly, so for each video
asset the planner extracts a handful of representative frames (via ffmpeg,
spread evenly across the clip's duration) and sends those as images, along
with the clip's duration and an optional transcript (see below). Photos are
sent directly. This is intentionally lossy — frame sampling is a proxy for
"seeing" the clip — which is also why the system prompt tells the model to
be conservative about clip quality when it's ambiguous.

### Transcription is stubbed, not built

`Transcriber` is an interface with a `NoopTranscriber` default. Job-site
before/after footage rarely carries load-bearing narration, and it wasn't
needed for the first build slice, so real ASR (e.g. Whisper) integration is
deferred — but the planner already threads a transcript through its prompt
when one is available, so wiring in a real transcriber later is a one-file
change (implement `Transcriber`, pass it into `ClaudePlanner`'s options).

## Storage and DB are swappable, not hardcoded

`Storage` (`packages/core/src/storage/storage.ts`) is an interface;
`LocalDiskStorage` is the only implementation today, and every path handled
above it (`Asset.filePath`, `Render.filePath`, ...) is *relative* to the
storage root — never an absolute filesystem path. Swapping in S3 later means
writing one new class, not touching every call site.

The DB is Prisma + SQLite for zero-config local dev. `Asset` already has an
`analysisHash` column reserved (but unused) for the future "don't reprocess
already-analyzed jobs" cache the spec calls out for scaling to 500+ file
batches — the intent is that ingestion can grow into using it without a
schema migration.

### Why the renderer needs a local HTTP server mid-render

Remotion's headless-browser render needs a URL it can fetch — it can't
reliably load arbitrary absolute filesystem paths from inside the browser
context it renders in. `packages/renderer/src/assetServer.ts` spins up a
plain Node `http` server rooted at the storage root for the duration of a
render call, and closes it afterward. This keeps the renderer agnostic to
where assets actually live on disk today — it just needs *something*
HTTP-servable, which still holds if storage moves to S3 (point it at a
presigned-URL-serving layer instead).

## What's explicitly deferred (matches the spec's stated first build task)

- **Bulk ingestion at scale** (500+ files/batch, folder-per-job or tagging at
  upload, automatic before/after pair *detection* as a separate pass) — v1 is
  one job at a time, uploaded through a single form. Before/after pairing is
  handled by the planner itself in its single structured call, not a
  separate heuristic pass, since the point of this build is "let the AI do
  the editing" rather than hand-rolling detection logic.
- **Scripting/TTS/teleprompter** — separate feature, not started.
- **Auto-posting integrations** — v1 only outputs finished files into the
  review queue.
- **Per-job/per-user branding** — v1 renders with a single global placeholder
  logo (`storage/branding/logo.png`, written by `pnpm seed:sample`). Real
  branding upload is a follow-up: `apps/web/lib/branding.ts` is
  intentionally the only place that decision is made.
