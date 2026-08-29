"use client";

import { motion, useReducedMotion } from "framer-motion";

type StripeDividerProps = {
  /** "light" for placement on offWhite/white, "dark" for blueDeep panels. */
  tone?: "light" | "dark";
  /** Draw the strokes on when the element enters the viewport. */
  animate?: boolean;
  /** Draw immediately on mount instead of waiting for the viewport. */
  animateOnMount?: boolean;
  /** Seconds of delay before the first stroke draws. */
  delay?: number;
  className?: string;
};

/**
 * The signature motif: a three-stroke diagonal paint sweep in red, white and
 * blue. Strokes are drawn with a slight taper and round caps so they read as
 * brush passes rather than flag stripes. Used sparingly — once in the hero and
 * once as a section divider.
 */
export default function StripeDivider({
  tone = "light",
  animate = true,
  animateOnMount = false,
  delay = 0,
  className = "",
}: StripeDividerProps) {
  const prefersReduced = useReducedMotion();

  const strokes = [
    { d: "M-40 96 C 300 84, 760 52, 1240 26", color: "#B31942", width: 15 },
    {
      d: "M-40 66 C 300 54, 760 24, 1240 -2",
      color: tone === "dark" ? "#FFFFFF" : "#FFFFFF",
      width: 12,
    },
    { d: "M-40 38 C 300 26, 760 -4, 1240 -30", color: "#14396B", width: 10 },
  ];

  // A hairline under the white stroke so it still reads on light backgrounds.
  const needsWhiteBacking = tone === "light";

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 1.1,
          ease: [0.22, 1, 0.36, 1] as const,
          delay: delay + i * 0.13,
        },
        opacity: { duration: 0.25, delay: delay + i * 0.13 },
      },
    }),
  };

  const shouldDraw = animate && !prefersReduced;
  const motionProps = shouldDraw
    ? animateOnMount
      ? { initial: "hidden" as const, animate: "visible" as const }
      : {
          initial: "hidden" as const,
          whileInView: "visible" as const,
          viewport: { once: true, amount: 0.4 },
        }
    : { initial: false as const };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <svg
        viewBox="0 0 1200 110"
        preserveAspectRatio="none"
        className="h-full w-full"
        role="presentation"
        focusable="false"
      >
        {strokes.map((stroke, i) => (
          <g key={stroke.color}>
            {needsWhiteBacking && stroke.color === "#FFFFFF" && (
              <path
                d={stroke.d}
                stroke="#E2E5EA"
                strokeWidth={stroke.width + 2}
                strokeLinecap="round"
                fill="none"
                opacity={0.9}
              />
            )}
            <motion.path
              d={stroke.d}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              fill="none"
              custom={i}
              variants={draw}
              {...motionProps}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
