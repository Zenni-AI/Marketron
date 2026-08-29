"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Plate from "./art/Plates";
import { media, type MediaKey, type MediaSlot } from "@/lib/media";

type MediaProps = {
  slot: MediaKey;
  /** Aspect ratio class, e.g. "aspect-[4/5]". Omit inside a sized parent. */
  aspect?: string;
  className?: string;
  /** Dark wash over the image so type stays readable on top. */
  scrim?: "none" | "soft" | "heavy" | "bottom";
  /** Show the slot's label chip. */
  showLabel?: boolean;
  /** Slow vertical drift as the frame passes through the viewport. */
  parallax?: boolean;
  rounded?: boolean;
  sizes?: string;
  priority?: boolean;
};

const scrims = {
  none: "",
  soft: "bg-[linear-gradient(180deg,rgba(10,38,71,0.25),rgba(10,38,71,0.45))]",
  // Directional: dark where the type sits, open enough on the far side that
  // the picture still reads as a picture.
  heavy:
    "bg-[linear-gradient(103deg,rgba(6,20,40,0.93)_0%,rgba(6,20,40,0.74)_42%,rgba(8,30,58,0.34)_100%)]",
  bottom:
    "bg-[linear-gradient(180deg,transparent_35%,rgba(8,26,52,0.85)_100%)]",
} as const;

/**
 * One image slot. Renders the real photograph when `src` is set in
 * lib/media.ts, and the hand-drawn plate for that slot until then — so the
 * layout is composed against real image shapes either way.
 */
export default function Media({
  slot,
  aspect,
  className = "",
  scrim = "none",
  showLabel = false,
  parallax = false,
  rounded = true,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: MediaProps) {
  // `satisfies` keeps the key literals; the annotation restores the full
  // slot shape (optional src/label/tone) for slots that omit those fields.
  const item: MediaSlot = media[slot];
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const inner = (
    <>
      {item.src ? (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <Plate
          name={item.plate}
          tone={item.tone ?? "night"}
          className="absolute inset-0"
        />
      )}
    </>
  );

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${rounded ? "rounded-card" : ""} ${
        aspect ?? ""
      } ${className}`}
    >
      {/* One stable element either way — swapping motion for plain would leave
          framer's inline transform behind when the preference resolves. */}
      <motion.div
        style={{ y: prefersReduced ? 0 : y }}
        className={parallax ? "absolute inset-[-6%]" : "absolute inset-0"}
      >
        {inner}
      </motion.div>

      {scrim !== "none" && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${scrims[scrim]}`}
        />
      )}

      {showLabel && item.label && (
        <div className="pointer-events-none absolute bottom-0 left-0 flex items-center gap-2.5 p-4">
          <span className="h-3 w-[3px] bg-red" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
            {item.label}
          </span>
        </div>
      )}
    </div>
  );
}
