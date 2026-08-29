"use client";

import { motion, useReducedMotion } from "framer-motion";
import Section from "./Section";

const EASE = [0.22, 1, 0.36, 1] as const;

const services = [
  {
    title: "Government Contract Painting",
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
      eyebrow="What We Do"
      heading="Two disciplines, one standard of finish"
      subtext="JVS Painting is built around the two kinds of work that leave no room for improvisation: public contracts with compliance requirements, and commercial properties that cannot afford downtime."
    >
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {services.map((service, i) => (
          <motion.article
            key={service.title}
            initial={prefersReduced ? false : { opacity: 0, y: 28 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
            className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white p-7 shadow-card transition-all duration-250 ease-premium hover:-translate-y-1.5 hover:border-transparent hover:shadow-card-hover sm:p-9"
          >
            {/* Accent rail wipes in on hover. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-red-gradient transition-transform duration-250 ease-premium group-hover:scale-x-100"
            />

            <h3 className="text-2xl leading-snug md:text-[1.75rem]">
              {service.title}
            </h3>
            <p className="mt-4 text-[15px] leading-[1.75] text-steel">
              {service.summary}
            </p>

            <ul className="mt-7 space-y-3.5 border-t border-line pt-7">
              {service.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckMark />
                  <span className="text-[15px] leading-relaxed text-blueDeep">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
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
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blueDeep/6 text-red transition-colors duration-250 group-hover:bg-red/10"
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
