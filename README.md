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
- Swap the case study photo placeholder in `components/CaseStudy.tsx` for real
  project photography.
- Replace the placeholder JVS favicon marks with the real logo.
