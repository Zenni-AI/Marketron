"use client";

import { useId } from "react";

/**
 * Placeholder for an image slot that has no photograph yet.
 *
 * Deliberately inert: a measured field with a fine grid and registration
 * ticks. It reads as a reserved plate on a drawing, not as an illustration —
 * nothing here is pretending to be a picture of the work.
 */
export default function TechnicalField({
  label,
  tone = "navy",
  className = "",
}: {
  label?: string;
  tone?: "navy" | "light";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const dark = tone === "navy";

  const ground = dark ? "#1C254F" : "#EDF0F6";
  const rule = dark ? "rgba(227,231,245,0.18)" : "rgba(31,41,93,0.16)";
  const ruleStrong = dark ? "rgba(227,231,245,0.4)" : "rgba(31,41,93,0.34)";
  const text = dark ? "rgba(227,231,245,0.55)" : "rgba(31,41,93,0.55)";

  return (
    <svg
      viewBox="0 0 240 150"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <pattern id={`g-${uid}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke={rule} strokeWidth="0.4" />
        </pattern>
      </defs>

      <rect width="240" height="150" fill={ground} />
      <rect width="240" height="150" fill={`url(#g-${uid})`} />

      {/* Registration ticks at the corners of the plate. */}
      <g stroke={ruleStrong} strokeWidth="1" fill="none">
        <path d="M10 22V10h12M218 10h12v12M230 128v12h-12M22 140H10v-12" />
      </g>

      <rect x="10" y="10" width="220" height="130" fill="none" stroke={rule} strokeWidth="0.6" />
      <path d="M10 75h220M120 10v130" stroke={rule} strokeWidth="0.5" />

      {/* One gold tick, so the plate still belongs to the brand. */}
      <rect x="10" y="72" width="26" height="1.6" fill="#FFCD05" opacity="0.85" />

      {label && (
        <text
          x="120"
          y="92"
          textAnchor="middle"
          fill={text}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="7"
          fontWeight="bold"
          letterSpacing="1.6"
        >
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
