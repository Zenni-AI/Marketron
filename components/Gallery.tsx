"use client";

import { motion, useReducedMotion } from "framer-motion";
import Media from "./Media";
import Section from "./Section";
import type { MediaKey } from "@/lib/media";

const EASE = [0.22, 1, 0.36, 1] as const;

const frames: { slot: MediaKey; caption: string }[] = [
  { slot: "workFacade", caption: "Facades & building exteriors" },
  { slot: "workWarehouse", caption: "Warehouse & industrial interiors" },
  { slot: "workTower", caption: "Tanks, towers & structures" },
  { slot: "workSteel", caption: "Structural steel coatings" },
  { slot: "workCrew", caption: "Occupied-building interiors" },
];

/**
 * The work band. On mobile it is a swipeable, snapping strip; from md up it
 * becomes an uneven grid — the second frame drops, so the row never reads as
 * five identical boxes.
 */
export default function Gallery() {
  const prefersReduced = useReducedMotion();

  return (
    <Section
      id="work"
      eyebrow="Selected Work"
      heading="The range of what we're called in for"
      subtext="Four decades of contracts across New Jersey — exteriors and interiors, occupied buildings and secured sites, one-off repaints and standing maintenance."
    >
      <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-5">
        {frames.map((frame, i) => (
          <motion.figure
            key={frame.slot}
            initial={prefersReduced ? false : { opacity: 0, y: 28 }}
            whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
            className={`group w-[72vw] shrink-0 snap-start sm:w-[46vw] md:w-auto ${
              i % 2 === 1 ? "lg:mt-12" : ""
            }`}
          >
            <div className="overflow-hidden rounded-card shadow-card ring-1 ring-line transition-shadow duration-250 ease-premium group-hover:shadow-card-hover">
              <Media
                slot={frame.slot}
                aspect="aspect-[4/5]"
                rounded={false}
                scrim="soft"
                sizes="(max-width: 768px) 72vw, 20vw"
                className="transition-transform duration-[700ms] ease-premium group-hover:scale-[1.05]"
              />
            </div>
            <figcaption className="mt-4 flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-red" />
              <span className="text-[13px] font-bold leading-snug text-blueDeep">
                {frame.caption}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}
