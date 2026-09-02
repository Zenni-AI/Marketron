"use client";

import Image from "next/image";
import TechnicalField from "./art/TechnicalField";
import { media, type MediaKey, type MediaSlot } from "@/lib/media";

type MediaProps = {
  slot: MediaKey;
  /** Aspect ratio class, e.g. "aspect-[3/2]". Omit inside a sized parent. */
  aspect?: string;
  className?: string;
  /** Dark wash over the photograph so type stays readable on top. */
  scrim?: "none" | "bottom";
  showLabel?: boolean;
  rounded?: boolean;
  sizes?: string;
  priority?: boolean;
  placeholderTone?: "navy" | "light";
};

/**
 * One image slot: the photograph when lib/media.ts has a src for it, and a
 * plain technical placeholder until then.
 */
export default function Media({
  slot,
  aspect,
  className = "",
  scrim = "none",
  showLabel = false,
  rounded = true,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  placeholderTone = "navy",
}: MediaProps) {
  const item: MediaSlot = media[slot];

  return (
    <div
      className={`relative overflow-hidden ${rounded ? "rounded-card" : ""} ${
        aspect ?? ""
      } ${className}`}
    >
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
        <TechnicalField
          label={item.label}
          tone={placeholderTone}
          className="absolute inset-0"
        />
      )}

      {scrim === "bottom" && item.src && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(14,19,48,0.88)_100%)]"
        />
      )}

      {showLabel && item.src && (
        <div className="pointer-events-none absolute bottom-0 left-0 flex items-center gap-2.5 p-4">
          <span className="h-3 w-[3px] bg-gold" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            {item.label}
          </span>
        </div>
      )}
    </div>
  );
}
