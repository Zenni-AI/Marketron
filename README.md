# Marketron Solar — lead generation funnel

A solar lead-generation funnel in the style of SolarReviews: a homeowner answers
nine questions about their roof and power bill, gets an instant **0–100 solar fit
score** with a real savings estimate, and is then invited to leave their details
so a solar expert can reach out.

The point of the funnel is that the estimate comes **before** the form. A visitor
who has just seen "your home scores 86/100, about $230/month in savings" converts
far better than one asked for a phone number cold — and the score doubles as
qualification, so the sales desk knows which leads are worth calling first.

---

## Quick start

```bash
npm install
cp .env.example .env        # set ADMIN_TOKEN at minimum
npm run dev                 # funnel on :5173, lead API on :5174
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server + lead API, with the API proxied under `/api` |
| `npm test` | Engine, validation, and storage tests |
| `npm run build` | Typecheck, then build the front end to `dist/` |
| `npm start` | Production: one Express process serving `dist/` and the API |

- Funnel: <http://localhost:5173>
- Lead desk: <http://localhost:5173/admin> (sign in with your `ADMIN_TOKEN`)

---

## The funnel

1. **ZIP code** — sets sun hours, electricity rate, and net metering rules
2. **Average monthly electric bill** — slider plus one-tap presets
3. **Do you own the property?** — the only hard disqualifier
4. **Roof shading**
5. **Roof orientation**
6. **Roof age**
7. **Electric utility** — optional, autocompletes from the detected state
8. **Purchase timeline** — drives lead priority
9. **Credit band** — decides which financing options to show; no credit check

Then: **results** → **contact form** → **"our solar experts will reach out"**.

Design decisions worth knowing about:

- **Renters are routed, not rejected.** Answering "I rent" skips the three roof
  questions and offers community solar instead. They still convert as a lead,
  just never as `hot`.
- **Answers auto-advance**, and progress is saved to `localStorage`, so a
  homeowner who bounces mid-funnel resumes where they left off.
- **The results page shows the maths**, including what is working *against* the
  home. Publishing the watch-outs is what makes the estimate credible.

## How the score works

Seven weighted factors, summing to 100 so the score reads as a percentage:

| Factor | Weight | Source |
| --- | --- | --- |
| Electricity usage | 24 | Reported monthly bill |
| Local power prices | 19 | State average retail rate |
| Sunlight | 17 | State average peak sun hours |
| Roof shading | 19 | Homeowner's answer |
| Roof orientation | 8 | Homeowner's answer |
| Solar policy | 8 | State net metering / incentive quality |
| Roof condition | 5 | Roof age |

Tiers: **excellent** ≥ 78, **strong** ≥ 62, **workable** ≥ 46, **limited** below.

This weighting produces results that match how solar economics actually work,
which sometimes surprises people. Phoenix scores *lower* than Los Angeles
despite far better sun, because Arizona's 15.5¢/kWh power is worth much less to
offset than California's 32¢. Sunshine alone is not the investment case.

Savings are modelled conservatively:

- Usage is inferred from the bill and the local retail rate.
- Production is derated for inverter/wiring losses, then again for the home's
  shading and roof orientation.
- Exports are valued below retail, blended by the state's net-metering quality.
- **First-year savings are capped at the homeowner's actual annual bill**, so the
  headline number can never exceed what they currently spend.
- Lifetime figures assume 2.5% annual utility escalation and 0.5% panel
  degradation over 25 years.

### Keep the incentive assumptions current

`shared/incentives.ts` is the file most likely to go stale, and its numbers are
shown to consumers. It currently assumes **no federal residential tax credit**:
Section 25D was terminated for expenditures made after 31 December 2025, so a
2026 cash or loan purchase claims nothing under it. Quoting the old 30% credit
would inflate every estimate the sales team then has to walk back on the call.

Lease and PPA pricing is a separate matter — the credit is claimed there by the
system owner at the business level, so model it in your lease pricing rather
than here. If your compliance team confirms different figures, change them in
that one file.

## Lead capture

`POST /api/leads` validates, scores, stores, and buckets each submission.

- **Priority** — `hot` (good fit, ready to buy, financeable, bill ≥ $120),
  `warm`, or `nurture`. A researcher is never `hot` no matter how good the roof.
- **Storage** — appended as JSON Lines to `data/leads.jsonl`. Append-only, so a
  crash mid-write cannot corrupt earlier leads. Swap `LeadStore` in
  `server/store.ts` for Postgres/Supabase when you outgrow it.
- **CRM handoff** — set `LEAD_WEBHOOK_URL` and every accepted lead is also POSTed
  there. It is fire-and-forget *after* the lead is safely on disk, so a CRM
  outage can never cost you a lead.
- **Abuse controls** — a hidden honeypot field (bots that fill it get a normal
  201 and are silently discarded, so they never learn what tripped them) and a
  12-per-hour-per-IP rate limit. Put your CDN's limiter in front for real
  traffic.

### Compliance

TCPA express written consent is required before the form will submit, and the
**exact consent wording is stored on every lead** alongside the timestamp, IP,
and user agent — that record is what you need if a consent claim is ever
disputed. The copy lives in `src/config.ts`; have counsel review it before
launch, and treat any edit as a new version rather than changing it
retroactively for leads already captured.

Attribution (`utm_*`, `gclid`, `fbclid`, `msclkid`) and referrer are captured
automatically, so paid-social and search spend is traceable to closed leads.

The privacy, terms, and do-not-sell links in the footer are placeholders — point
them at real pages before you run traffic.

## API

| Endpoint | Auth | Purpose |
| --- | --- | --- |
| `GET /api/health` | — | Liveness |
| `POST /api/evaluate` | — | Score a home without capturing a lead |
| `POST /api/leads` | — | Capture a lead |
| `GET /api/leads` | Bearer | All leads, newest first |
| `GET /api/leads.csv` | Bearer | CSV export for the sales team |

## Data accuracy

`shared/geo.ts` holds planning-grade **state averages** for sun hours,
electricity rates, and policy quality, and resolves ZIPs by 3-digit prefix
range. That is accurate enough to tell a homeowner whether solar is worth a
conversation, and the funnel always shows the detected state back to them so
they can correct it.

Before anyone quotes a contract price, replace these with per-address
irradiance (PVWatts) and the homeowner's real utility tariff (Genability or a
utility API). The seams are `profileFromZip()` and `estimateSavings()`.

## Layout

```
shared/     solar-engine.ts   scoring + savings, shared by client and server
            geo.ts            ZIP→state, sun hours, rates, policy
            incentives.ts     incentive + hardware assumptions (keep current)
            validation.ts     zod schemas shared by both sides
src/        funnel/           wizard, results, contact form, confirmation
            pages/            landing page, lead desk
server/     index.ts          lead API
            store.ts          JSON Lines store + CSV export
tests/      engine, validation, and storage tests
```
