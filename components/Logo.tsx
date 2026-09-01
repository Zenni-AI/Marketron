import Image from "next/image";

/**
 * The J.V.S. Painting lockup, from the company's own artwork.
 *
 * The source PDF is drawn rotated (the type reads bottom-to-top); the SVGs in
 * /public/logo are the corrected landscape lockup, 705x284 — always scale by
 * height and let the width follow, so the roller never distorts.
 */
export default function Logo({
  variant = "navy",
  className = "",
  priority = false,
}: {
  /** "knockout" is the white-on-dark version for navy panels. */
  variant?: "navy" | "knockout";
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={
        variant === "knockout"
          ? "/logo/jvs-painting-knockout.svg"
          : "/logo/jvs-painting.svg"
      }
      alt="J.V.S. Painting"
      width={705}
      height={284}
      priority={priority}
      className={`w-auto ${className}`}
    />
  );
}
