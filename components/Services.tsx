"use client";

import { motion, useReducedMotion } from "framer-motion";
import Section from "./Section";
import { IconCheck } from "./art/Icons";

const EASE = [0.22, 1, 0.36, 1] as const;

const services = [
  {
    label: "Public Work",
    title: "Government & Municipal Contracts",
    summary:
      "Work performed to the standard a public contract demands — documented, compliant and scheduled around the facility, not the crew.",
    points: [
      "Military and installation facilities",
      "Municipal buildings, firehouses & public works",
      "E-Verify participating employer",
      "Schools, districts and county facilities",
      "Prevailing wage / Davis-Bacon familiarity",
      "Bonded & insured for public bidding",
      "Scheduling around base and building operations",
    ],
  },
  {
    label: "Private Sector",
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
      tone="tinted"
      eyebrow="What We Do"
      heading="Two disciplines, one standard of finish"
      subtext="JVS Painting is built around the two kinds of work that leave no room for improvisation: public contracts — federal, state and municipal — with the compliance requirements that come with them, and commercial properties that cannot afford downtime."
    >
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {services.map((service, i) => (
          <motion.article
            key={service.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.7, ease: EASE, delay: i * 0.1 }
            }
            className="group relative flex flex-col rounded-card border border-line bg-white p-7 shadow-card transition-all duration-250 ease-premium hover:-translate-y-1 hover:shadow-card-hover sm:p-9"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 rounded-t-card bg-gold transition-transform duration-250 ease-premium group-hover:scale-x-100"
            />

            <p className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-steel">
              {service.label}
            </p>
            <h3 className="text-2xl leading-snug md:text-[1.75rem]">
              {service.title}
            </h3>
            <p className="mt-4 text-[15px] leading-[1.75] text-steel">
              {service.summary}
            </p>

            <ul className="mt-7 space-y-3.5 border-t border-line pt-7">
              {service.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-gold"
                  >
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span className="text-[15px] leading-relaxed text-navy">
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
