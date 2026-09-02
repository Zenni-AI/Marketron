"use client";

import { motion, useReducedMotion } from "framer-motion";
import Media from "./Media";
import Section from "./Section";
import {
  IconFacade,
  IconWarehouse,
  IconTank,
  IconSteel,
  IconInterior,
  IconDocument,
} from "./art/Icons";
import { hasPhotography, type MediaKey } from "@/lib/media";

const EASE = [0.22, 1, 0.36, 1] as const;

const capabilities: {
  Icon: typeof IconFacade;
  title: string;
  body: string;
  slot?: MediaKey;
}[] = [
  {
    Icon: IconFacade,
    title: "Facades & Building Exteriors",
    body: "Multi-story exteriors worked from scaffold or lift, with surface prep and coatings specified for the substrate.",
    slot: "workExterior",
  },
  {
    Icon: IconWarehouse,
    title: "Warehouse & Industrial",
    body: "High-bay interiors, structural decking, safety striping and dock areas, staged to keep the building in service.",
    slot: "workIndustrial",
  },
  {
    Icon: IconTank,
    title: "Tanks & Structures",
    body: "Elevated tanks, towers and exposed structures, including containment and high-performance coating systems.",
    slot: "workStructures",
  },
  {
    Icon: IconSteel,
    title: "Structural Steel",
    body: "Primer and finish systems over structural steel, worked from suspended stages where access demands it.",
  },
  {
    Icon: IconInterior,
    title: "Occupied Interiors",
    body: "Offices, corridors and common areas repainted around a live building on off-hours and weekend schedules.",
    slot: "workInterior",
  },
  {
    Icon: IconDocument,
    title: "Standing Maintenance",
    body: "Recurring repaint and touch-up programmes for owners who would rather schedule the work than react to it.",
  },
];

/**
 * What the firm is called in for. Renders as capability tiles; each tile takes
 * a photograph automatically once one is set for its slot in lib/media.ts.
 */
export default function Capabilities() {
  const prefersReduced = useReducedMotion();

  return (
    <Section
      id="capabilities"
      eyebrow="Capabilities"
      heading="The range of work we're called in for"
      subtext="Four decades of contracts across New Jersey — exteriors and interiors, occupied buildings and secured sites, one-off repaints and standing maintenance."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {capabilities.map(({ Icon, title, body, slot }, i) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.65, ease: EASE, delay: i * 0.07 }
            }
            className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-250 ease-premium hover:-translate-y-1 hover:shadow-card-hover"
          >
            {hasPhotography && slot && (
              <Media
                slot={slot}
                aspect="aspect-[3/2]"
                rounded={false}
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            )}

            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-navy text-gold transition-colors duration-250 group-hover:bg-gold group-hover:text-navy">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg leading-snug">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{body}</p>
            </div>

            <span
              aria-hidden="true"
              className="h-[3px] w-full origin-left scale-x-0 bg-gold transition-transform duration-250 ease-premium group-hover:scale-x-100"
            />
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
