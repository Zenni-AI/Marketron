"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IconBadge, IconShield, IconDocument, IconClock } from "./art/Icons";
import { Reveal } from "./Section";

const EASE = [0.22, 1, 0.36, 1] as const;

const credentials = [
  {
    Icon: IconBadge,
    title: "E-Verify Participating Employer",
    body: "Every hire is run through E-Verify, so workforce eligibility is documented before anyone reaches your site.",
  },
  {
    Icon: IconShield,
    title: "Licensed, Bonded & Insured",
    body: "Carrying the coverage public work requires. Certificates of insurance and bonding are issued on request.",
  },
  {
    Icon: IconDocument,
    title: "Prevailing Wage & Davis-Bacon",
    body: "Familiar with certified payroll and wage determinations on both federal Davis-Bacon and New Jersey prevailing wage work.",
  },
  {
    Icon: IconClock,
    title: "Scheduled Around Operations",
    body: "Off-hours, weekend and phased work so a facility keeps running while the work gets done.",
  },
];

/**
 * The qualification block. A contracting officer is deciding whether this firm
 * is worth a solicitation — this is what that decision is made on.
 */
export default function Credentials() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="credentials" className="relative bg-navy py-16 md:py-section">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(227,231,245,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(227,231,245,0.08)_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <div className="relative mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <Reveal>
            <div className="mb-5 flex items-center gap-4">
              <span className="h-[3px] w-10 bg-gold" />
              <p className="eyebrow text-gold">Compliance</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-display-sm text-balance text-white md:text-display-md">
              Built to clear the paperwork, not just the walls
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-prose text-base leading-[1.8] text-white/85 md:text-lg">
              Public work is won on documentation as much as on finish quality.
              JVS Painting is set up for both.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {credentials.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={
                prefersReduced
                  ? { duration: 0 }
                  : { duration: 0.65, ease: EASE, delay: i * 0.08 }
              }
              className="flex h-full flex-col rounded-card bg-white p-6 shadow-card transition-transform duration-250 ease-premium hover:-translate-y-1"
            >
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-navy text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg leading-snug">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{body}</p>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-white/70">
            Registration details, insurance certificates and past-performance
            references are provided with every bid package.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
