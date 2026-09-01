"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useReducedMotion } from "framer-motion";

type AnimatedCounterProps = {
  /**
   * A number counts up from zero on scroll into view. A string is a
   * non-numeric credential (e.g. "E-Verify") and simply reveals in place.
   */
  value: number | string;
  suffix?: string;
  label: string;
  /** Count-up duration in ms. */
  duration?: number;
  className?: string;
  /** Visual weight of the figure. */
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
};

const sizeClasses = {
  sm: "text-4xl md:text-5xl",
  md: "text-5xl md:text-6xl",
  lg: "text-7xl md:text-8xl",
} as const;

// Ease-out-expo: fast start, long settle — reads as deliberate, not mechanical.
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function AnimatedCounter({
  value,
  suffix = "",
  label,
  duration = 1800,
  className = "",
  size = "md",
  tone = "light",
}: AnimatedCounterProps) {
  const isNumeric = typeof value === "number";
  const prefersReduced = useReducedMotion();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const [display, setDisplay] = useState(isNumeric ? 0 : value);
  const frame = useRef<number>();

  useEffect(() => {
    if (!isNumeric) return;

    // Reduced motion: land on the final figure without waiting for the
    // viewport, so the number is never left sitting at zero.
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    if (!inView) return;

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(easeOutExpo(progress) * (value as number)));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [inView, isNumeric, value, duration, prefersReduced]);

  const figureColor = tone === "dark" ? "text-white" : "text-navy";
  const labelColor = tone === "dark" ? "text-white/60" : "text-steel";

  return (
    <div ref={ref} className={className}>
      {/* The figure is always painted — the count-up is the reveal. Gating
          visibility on the observer risks leaving it invisible. */}
      <div
        className={`font-display font-normal leading-none ${sizeClasses[size]} ${figureColor}`}
      >
        {display}
        {suffix && (
          <span className={tone === "dark" ? "text-gold" : "text-navy"}>
            {suffix}
          </span>
        )}
      </div>
      <div
        className={`mt-3 font-sans text-xs font-bold uppercase leading-relaxed tracking-[0.14em] ${labelColor}`}
      >
        {label}
      </div>
    </div>
  );
}
