"use client";

import { motion, useReducedMotion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import Media from "./Media";
import { IconBadge, IconCheck } from "./art/Icons";
import { hasPhotography } from "@/lib/media";
import { BID_FORM_ID, scrollToId } from "@/lib/scroll";

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: 40 as number, suffix: "+", label: "Years in Business" },
  { value: "E-Verify", label: "Participating Employer" },
  { value: "Licensed", label: "& Fully Insured" },
  { value: "NJ", label: "Based in New Jersey" },
];

/** The facts a contracting officer scans for before reading anything else. */
const snapshot = [
  ["Established", "Over 40 years in business"],
  ["Contract types", "Government, municipal & commercial"],
  ["Workforce", "E-Verify participating employer"],
  ["Coverage", "Licensed, bonded & fully insured"],
  ["Wage compliance", "Prevailing wage / Davis-Bacon"],
  ["Office", "Riverside, New Jersey"],
];

export default function Hero() {
  const prefersReduced = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  // Reduced motion resolves after hydration, so the reduced variants state the
  // rest position explicitly rather than being empty.
  const item = prefersReduced
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
      };

  return (
    <section id="top" className="relative w-full overflow-hidden bg-navyDeep">
      {/* A measured field, not a scene: fine grid, one gold rule. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(227,231,245,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(227,231,245,0.09)_1px,transparent_1px)] [background-size:56px_56px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gold"
      />

      <div className="relative mx-auto w-full max-w-content px-5 pb-14 pt-32 sm:px-8 md:pb-20 md:pt-40 lg:px-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16"
        >
          <div>
            <motion.div variants={item} className="mb-8 flex items-center gap-4">
              <span className="h-[3px] w-10 bg-gold" />
              {/* Kept to one line so it stays aligned with the rule; the
                  headline below carries the rest. */}
              <p className="eyebrow whitespace-nowrap text-gold">
                Government &middot; Municipal &middot; Commercial
              </p>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-display-sm text-balance text-white sm:text-display-md lg:text-display-lg"
            >
              40+ Years of Painting Trusted by{" "}
              <span className="text-gold">Government &amp; Commercial</span>{" "}
              Clients
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-8 max-w-xl text-base leading-[1.75] text-white/85 sm:text-lg"
            >
              From military installations to municipal buildings and major
              commercial facilities, JVS Painting has delivered dependable,
              code-compliant work across New Jersey for over four decades.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center"
            >
              <button
                type="button"
                onClick={() => scrollToId(BID_FORM_ID)}
                className="btn-primary px-8 py-4"
              >
                Submit a Bid Request
              </button>
              <a href="#capabilities" className="btn-ghost group px-8 py-4">
                Our Capabilities
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="transition-transform duration-200 ease-premium group-hover:translate-y-0.5"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* White panel against the navy field — the strongest contrast on the
              page, carrying the facts a buyer qualifies us on. */}
          <motion.div variants={item} className="lg:pt-2">
            <div className="overflow-hidden rounded-card bg-white shadow-elevated">
              <div className="flex items-center gap-3 border-b border-line bg-offWhite px-6 py-4 sm:px-7">
                <IconBadge className="h-5 w-5 text-navy" />
                <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-navy">
                  Contractor Snapshot
                </h2>
              </div>

              <dl className="divide-y divide-line">
                {snapshot.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-baseline justify-between gap-6 px-6 py-3.5 sm:px-7"
                  >
                    <dt className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-steel">
                      {label}
                    </dt>
                    <dd className="text-right text-[15px] font-bold leading-snug text-navy">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex items-center gap-3 border-t border-line bg-offWhite px-6 py-4 sm:px-7">
                <IconCheck className="h-4 w-4 shrink-0 text-navy" />
                <p className="text-[13px] leading-snug text-steel">
                  Bids returned promptly, with references available on request.
                </p>
              </div>
            </div>

            {hasPhotography && (
              <Media
                slot="heroPrimary"
                aspect="aspect-[3/2]"
                className="mt-6 ring-1 ring-white/15"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Stat strip: full-width band closing the hero. */}
      <div className="relative border-t border-white/15 bg-navy">
        <div className="mx-auto grid w-full max-w-content grid-cols-2 gap-x-6 gap-y-8 px-5 py-9 sm:px-8 md:grid-cols-4 md:gap-8 lg:px-10">
          {stats.map((stat) => (
            <AnimatedCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              size="sm"
              tone="dark"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
