"use client";

import { motion, useReducedMotion } from "framer-motion";
import Media from "./Media";
import Section from "./Section";
import type { MediaKey } from "@/lib/media";

const EASE = [0.22, 1, 0.36, 1] as const;

const services: {
  title: string;
  slot: MediaKey;
  summary: string;
  points: string[];
}[] = [
  {
    title: "Government Contract Painting",
    slot: "serviceGovernment",
    summary:
      "Work performed to the standard a public contract demands — documented, compliant and scheduled around the facility, not the crew.",
    points: [
      "Military and installation facilities",
      "E-Verify participating employer",
      "Prevailing wage / Davis-Bacon familiarity",
      "Bonded & insured for public contracts",
      "Flexible scheduling around base operations",
    ],
  },
  {
    title: "Commercial Painting",
    slot: "serviceCommercial",
    summary:
      "Large-scale interior and exterior work for property owners and managers who need the building back in service on time.",
    points: [
      "Office & retail",
      "Warehouses & industrial",
      "Multi-family & property management",
      "Off-hours and weekend scheduling",
      "Long-term maintenance contracts",
    ],
  },
];

export default function Services() {
  const prefersReduced = useReducedMotion();

  return (
    <Section
      id="services"
      tone="tinted"
      eyebrow="What We Do"
      heading="Two disciplines, one standard of finish"
      subtext="JVS Painting is built around the two kinds of work that leave no room for improvisation: public contracts with compliance requirements, and commercial properties that cannot afford downtime."
    >
      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        {services.map((service, i) => (
          <motion.article
            key={service.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.75, ease: EASE, delay: i * 0.12 }
            }
            className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-250 ease-premium hover:-translate-y-1.5 hover:shadow-card-hover"
          >
            <div className="relative overflow-hidden">
              <Media
                slot={service.slot}
                aspect="aspect-[16/10]"
                rounded={false}
                scrim="bottom"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="transition-transform duration-[600ms] ease-premium group-hover:scale-[1.04]"
              />
              <h3 className="absolute inset-x-0 bottom-0 p-6 text-2xl leading-snug text-white sm:p-7 md:text-[1.75rem]">
                {service.title}
              </h3>
            </div>

            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <p className="text-[15px] leading-[1.75] text-steel">
                {service.summary}
              </p>

              <ul className="mt-7 space-y-3.5 border-t border-line pt-7">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckMark />
                    <span className="text-[15px] leading-relaxed text-navy">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

function CheckMark() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy/[0.06] text-navy transition-colors duration-250 group-hover:bg-gold/40"
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}
