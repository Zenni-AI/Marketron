# JVS Painting Inc. — Website

Marketing site for JVS Painting Inc., a commercial and government contract
painting company based in Riverside, NJ. Single scrolling landing page built
around one conversion point: the bid request form.

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Resend

## Getting started

```bash
npm install
cp .env.example .env.local   # add your Resend key
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | yes, for form delivery | Sends bid requests via [Resend](https://resend.com/api-keys). Without it `/api/bid` returns a 500 and the form shows its error state. |
| `BID_INBOX` | no | Where bid requests are delivered. Defaults to the `bids@jvspainting.com` **placeholder** — set this to the real inbox. |
| `BID_FROM` | no | Verified Resend sender. Defaults to `onboarding@resend.dev` until `jvspainting.com` is verified in Resend. |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical/Open Graph base URL. Defaults to `https://jvspainting.com`. |

Never commit real keys — `.env*` is gitignored; `.env.example` is the only
env file in version control.

## Photography

Every image slot on the page is declared once in `lib/media.ts`. Until real
photographs exist, each slot renders a hand-drawn artwork plate from
`components/art/Plates.tsx` — original screen-print style illustrations of the
work (scaffolded facade, hangar, warehouse, boom lift, crew, water tower,
structural steel, finish detail), not stock imagery.

To use a real photograph, drop the file in `public/work/` and set `src` on that
slot:

```ts
caseMain: {
  id: "caseMain",
  plate: "hangar",
  src: "/work/hangar-exterior.jpg",   // <- add this
  alt: "Crew coating a hangar door at a New Jersey installation",
  ...
}
```

Nothing else changes: `components/Media.tsx` swaps the plate for a lazy-loaded
`next/image` in the same frame, at the same aspect ratio. Every slot carries a
`note` describing what to shoot and in what shape — shoot to those and the
layout holds.

The plates are drawn on a 240x120 canvas and cropped with `slice`, so the
subject of each sits in the centre band (x 72-168) with supporting structure
running to the edges. Keep that rule if you add one.

## Structure

```
app/
  page.tsx                 landing page composition
  layout.tsx               metadata, structured data, system font stacks
  api/bid/route.ts         POST endpoint — validates and emails submissions
  icon.svg, apple-icon.tsx, opengraph-image.tsx
components/
  Header, Hero, Services, CaseStudy, Reputation,
  BidSection, BidForm, Footer, StickyCTABar,
  Section (scroll reveal), AnimatedCounter, StripeDivider
lib/scroll.ts              in-page scrolling helper
```

Design tokens (palette, type scale, elevation, easing) live in
`tailwind.config.ts`; base styles and button components in `app/globals.css`.

## Deploying to Vercel

1. Push this repository to GitHub.
2. In Vercel, **Add New → Project**, import the repository. The framework is
   detected as Next.js — no build settings to change.
3. Under **Environment Variables**, add `RESEND_API_KEY` (and `BID_INBOX` /
   `BID_FROM` if overriding) for Production, Preview and Development.
4. **Deploy.** Vercel then auto-deploys every push to `main`, and builds a
   preview deployment for every pull request.
5. Add the custom domain under **Settings → Domains** and point DNS at Vercel.
   Once the domain is live, set `NEXT_PUBLIC_SITE_URL` to match.

`vercel.json` pins the framework and runs functions in `iad1` (US East,
nearest to New Jersey).

## Before launch

- Replace the `bids@jvspainting.com` placeholder inbox (`BID_INBOX`).
- Verify `jvspainting.com` in Resend and set `BID_FROM` to an address on it.
- Replace the artwork plates with real project photography — see
  **Photography** above. This is the single biggest visual upgrade available.
- Replace the placeholder JVS favicon marks with the real logo.
