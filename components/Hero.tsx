"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import Media from "./Media";
import Texture from "./Texture";
import { BID_FORM_ID, scrollToId } from "@/lib/scroll";

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: 40 as number, suffix: "+", label: "Years in Business" },
  { value: "E-Verify", label: "Participating Employer" },
  { value: "Licensed", label: "& Fully Insured" },
  { value: "NJ", label: "Based in New Jersey" },
];

/**
 * Editorial split: type holds a solid navy field on the left, the picture
 * takes the right and bleeds off the edge, and a second frame overlaps the
 * seam between them.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const panelY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "24%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const parallax = (style: Record<string, unknown>) =>
    prefersReduced ? undefined : style;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  // Reduced motion resolves after hydration, so the reduced variants must
  // state the rest position explicitly rather than being empty.
  const item = prefersReduced
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
      };

  return (
    <section
      ref={ref}
      id="top"
      className="relative w-full overflow-hidden bg-hero-gradient pt-24 md:pt-0"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(255,255,255,0.10),transparent_55%)]"
      />

      {/* The picture: right half from md up, bleeding off the edge. */}
      <motion.div
        style={parallax({ y: panelY })}
        className="absolute inset-y-0 right-0 hidden w-[48%] md:block lg:w-[52%]"
      >
        <Media
          slot="heroBackdrop"
          rounded={false}
          priority
          sizes="55vw"
          className="h-full w-full"
        />
        {/* Feather the picture into the navy field instead of butting it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,#1F295D_0%,rgba(10,38,71,0.85)_18%,rgba(10,38,71,0.12)_52%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#1F295D,transparent)]"
        />
      </motion.div>

      <Texture opacity={0.26} />

      <motion.div
        style={parallax({ y: contentY, opacity: contentOpacity })}
        className="relative z-10 mx-auto flex w-full max-w-content flex-col justify-center px-5 sm:px-8 md:min-h-[100svh] md:pb-32 md:pt-36 lg:px-10"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          <motion.div variants={item} className="mb-7 flex items-center gap-4">
            <span className="h-[3px] w-10 bg-gold" />
            <p className="eyebrow text-white/70">
              Commercial &amp; Government Painting Contractors
            </p>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-display-sm text-balance text-white sm:text-display-md lg:text-display-lg"
          >
            40+ Years of Painting Trusted by{" "}
            <span className="relative inline-block text-gold">
              Government &amp; Commercial
              <BrushUnderline />
            </span>{" "}
            Clients
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-lg text-base leading-[1.75] text-white/75 sm:text-lg"
          >
            From military installations to major commercial facilities, JVS
            Painting has delivered dependable, code-compliant work across New
            Jersey for over four decades.
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
            <a href="#work" className="btn-ghost group px-8 py-4">
              See Our Work
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
        </motion.div>

        {/* Mobile gets its own picture rather than a cropped backdrop. */}
        <motion.div variants={item} initial="hidden" animate="visible" className="md:hidden">
          <Media
            slot="heroMobile"
            aspect="aspect-[16/10]"
            className="mt-12 ring-1 ring-white/12"
            sizes="100vw"
          />
        </motion.div>
      </motion.div>

      {/* Second frame, overlapping the seam between field and picture. */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          prefersReduced
            ? { duration: 0 }
            : { duration: 0.9, delay: 0.5, ease: EASE }
        }
        className="absolute bottom-[18%] left-[52%] z-20 hidden w-[18%] lg:block"
      >
        <Media
          slot="heroInset"
          aspect="aspect-[4/5]"
          showLabel
          className="shadow-elevated ring-1 ring-white/20"
          sizes="25vw"
        />
      </motion.div>

      {/* Stat strip anchored to the base of the frame. */}
      <div className="relative z-10 mt-12 border-t border-white/12 bg-navy/70 backdrop-blur-sm md:absolute md:inset-x-0 md:bottom-0 md:mt-0">
        <div className="mx-auto grid w-full max-w-content grid-cols-2 gap-x-6 gap-y-7 px-5 py-7 sm:px-8 md:grid-cols-4 md:gap-8 md:py-8 lg:px-10">
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

/** A rough, hand-drawn stroke under the emphasised phrase. */
function BrushUnderline() {
  const prefersReduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 300 14"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute -bottom-1 left-0 h-[0.22em] w-full overflow-visible"
    >
      <motion.path
        d="M2 9 C 60 3, 110 12, 168 6 C 214 1.5, 260 10, 298 5"
        stroke="#FFCD05"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={
          prefersReduced ? { duration: 0 } : { duration: 1.1, delay: 0.9, ease: EASE }
        }
      />
    </svg>
  );
}
