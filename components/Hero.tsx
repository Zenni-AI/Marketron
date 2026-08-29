"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import StripeDivider from "./StripeDivider";
import { BID_FORM_ID, scrollToId } from "@/lib/scroll";

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: 40 as number, suffix: "+", label: "Years in Business" },
  { value: "E-Verify", label: "Participating Employer" },
  { value: "Licensed", label: "& Fully Insured" },
  { value: "NJ", label: "Based in New Jersey" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax: content drifts up and fades, the stripe trails behind it.
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // The sweep sinks slightly (clipped by the hero) rather than lifting off its
  // bottom edge, so no gap opens between the hero and the section below.
  const stripeY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const parallax = (style: Record<string, unknown>) =>
    prefersReduced ? undefined : style;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
  };

  // Reduced motion resolves after hydration, so the "reduced" variants must
  // state the rest position explicitly — empty variants would strand elements
  // at the hidden values applied on the first render.
  const item = prefersReduced
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      }
    : {
        hidden: { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.75, ease: EASE },
        },
      };

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] w-full items-center overflow-hidden bg-hero-gradient pb-28 pt-24 sm:pb-32 md:pt-32"
    >
      {/* Depth: an off-center light bloom behind the headline. */}
      <motion.div
        aria-hidden="true"
        style={parallax({ y: glowY })}
        className="pointer-events-none absolute -right-[20%] top-[-10%] h-[70vh] w-[70vw] rounded-full bg-blueMid opacity-50 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.08),transparent_55%)]"
      />

      {/* Signature motif — draws on at load, sweeping out of the hero's base. */}
      <motion.div
        style={parallax({ y: stripeY })}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 md:h-28"
      >
        <StripeDivider
          tone="dark"
          animateOnMount
          delay={0.55}
          className="h-full w-full"
        />
      </motion.div>

      <motion.div
        style={parallax({ y: contentY, opacity: contentOpacity })}
        className="relative z-10 mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          <motion.p
            variants={item}
            className="eyebrow mb-7 text-white/55"
          >
            Commercial &amp; Government Painting Contractors
          </motion.p>

          <motion.h1
            variants={item}
            className="text-display-sm text-balance text-white sm:text-display-md lg:text-display-lg xl:text-display-xl"
          >
            40+ Years of Painting Trusted by{" "}
            <span className="text-red">Government &amp; Commercial</span>{" "}
            Clients
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-2xl text-base leading-[1.75] text-white/70 sm:text-lg md:text-xl md:leading-[1.7]"
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
              className="btn-red px-8 py-4"
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

          <motion.div
            variants={item}
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/15 pt-8 sm:mt-14 sm:gap-y-9 sm:pt-9 md:grid-cols-4 md:gap-8"
          >
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
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
