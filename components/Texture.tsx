"use client";

import { useId } from "react";

/**
 * Film grain laid over a section. Flat color fields are what make a page look
 * machine-made; a little noise is what photographic layouts have by default.
 */
export default function Texture({
  className = "",
  opacity = 0.22,
}: {
  className?: string;
  opacity?: number;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ mixBlendMode: "overlay" }}
    >
      <filter id={`t-${uid}`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#t-${uid})`} opacity={opacity} />
    </svg>
  );
}
