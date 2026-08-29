"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  heading?: ReactNode;
  subtext?: ReactNode;
  children?: ReactNode;
  /** Panel background. */
  tone?: "light" | "dark" | "tinted";
  align?: "left" | "center";
  size?: "default" | "lg";
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
};

const toneClasses = {
  light: "bg-offWhite",
  dark: "bg-hero-gradient",
  tinted: "bg-white",
} as const;

/**
 * Scroll-reveal wrapper: fade + slide up, respecting prefers-reduced-motion.
 *
 * The shape matters. `useReducedMotion` resolves AFTER hydration, so the first
 * render always applies the animated `initial` (opacity 0). Swapping the
 * motion element for a plain one on the second render does NOT clear that —
 * React reuses the same DOM node and framer's inline style stays, leaving the
 * content permanently invisible. So: always render the motion element, always
 * define the rest target, and express the preference as a zero duration.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }
      }
    >
      {children}
    </motion.div>
  );
}

export default function Section({
  id,
  eyebrow,
  heading,
  subtext,
  children,
  tone = "light",
  align = "left",
  size = "default",
  className = "",
  containerClassName = "",
  headerClassName = "",
}: SectionProps) {
  const isDark = tone === "dark";
  const hasHeader = Boolean(eyebrow || heading || subtext);

  return (
    <section
      id={id}
      className={`relative ${toneClasses[tone]} ${
        size === "lg"
          ? "py-20 md:py-section-lg"
          : "py-16 md:py-section"
      } ${className}`}
    >
      <div
        className={`mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10 ${containerClassName}`}
      >
        {hasHeader && (
          <div
            className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${headerClassName}`}
          >
            {eyebrow && (
              <Reveal>
                <p
                  className={`eyebrow mb-5 ${isDark ? "text-white/55" : "text-red"}`}
                >
                  {eyebrow}
                </p>
              </Reveal>
            )}
            {heading && (
              <Reveal delay={0.08}>
                <h2
                  className={`text-display-sm md:text-display-md text-balance ${
                    isDark ? "text-white" : "text-blueDeep"
                  }`}
                >
                  {heading}
                </h2>
              </Reveal>
            )}
            {subtext && (
              <Reveal delay={0.16}>
                <div
                  className={`mt-6 max-w-prose text-base leading-[1.75] md:text-lg ${
                    align === "center" ? "mx-auto" : ""
                  } ${isDark ? "text-white/70" : "text-steel"}`}
                >
                  {subtext}
                </div>
              </Reveal>
            )}
          </div>
        )}

        {children && <div className={hasHeader ? "mt-14" : ""}>{children}</div>}
      </div>
    </section>
  );
}
