"use client";

import { motion, useReducedMotion } from "framer-motion";
import StripeDivider from "./StripeDivider";
import { Reveal } from "./Section";

const EASE = [0.22, 1, 0.36, 1] as const;

const facts = [
  { label: "Client Type", value: "Military Installation" },
  { label: "Scope", value: "Facility Painting" },
  { label: "Location", value: "New Jersey" },
];

export default function CaseStudy() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="work" className="relative overflow-hidden bg-hero-gradient">
      <StripeDivider
        tone="dark"
        className="h-16 w-full opacity-80 md:h-24"
      />

      <div className="mx-auto w-full max-w-content px-5 py-16 sm:px-8 md:py-24 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow mb-5 text-white/55">Featured Project</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-display-sm text-balance text-white md:text-display-md">
                Joint Base McGuire-Dix-Lakehurst
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-7 space-y-5 text-base leading-[1.8] text-white/70 md:text-lg">
                <p>
                  Commercial-grade painting services delivered for one of New
                  Jersey&rsquo;s major military installations — one example of
                  the caliber of work JVS Painting has provided for over four
                  decades.
                </p>
                <p>
                  Work of this scale requires more than a paint crew: it takes a
                  contractor who understands security protocols, scheduling
                  constraints, and the standard of finish a government facility
                  expects.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <dl className="mt-11 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-white/12 bg-white/12 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="bg-blueDeep px-6 py-5">
                    <dt className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-white">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 32 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
            className="relative"
          >
            {/* Photo placeholder — swap for a real project photograph. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-white/12 bg-[linear-gradient(150deg,#14396B_0%,#0A2647_100%)] shadow-elevated">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.10),transparent_60%)]"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 text-white/70">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </span>
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                  Project Photography
                </p>
              </div>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-1.5 w-2/3 bg-red"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <StripeDivider
        tone="dark"
        className="h-16 w-full rotate-180 opacity-80 md:h-24"
      />
    </section>
  );
}
