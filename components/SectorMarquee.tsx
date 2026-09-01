"use client";

const SECTORS = [
  "Military Installations",
  "Federal & State Facilities",
  "Warehouses & Distribution",
  "Office & Retail",
  "Multi-Family Housing",
  "Schools & Municipal",
  "Industrial Plants",
  "Property Management",
];

/**
 * A moving band of the sectors JVS works in. Sits directly under the hero as a
 * breath between the photograph and the first real section.
 */
export default function SectorMarquee() {
  return (
    <div className="relative overflow-hidden border-b border-line bg-white py-5">
      {/* Fade the band into the page edges instead of cutting it off. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-[linear-gradient(90deg,#FFFFFF,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-[linear-gradient(270deg,#FFFFFF,transparent)]"
      />

      <div className="flex w-max animate-marquee items-center gap-10 motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
        {[0, 1].map((pass) => (
          <div key={pass} className="flex items-center gap-10" aria-hidden={pass === 1}>
            {SECTORS.map((sector) => (
              <span key={sector} className="flex items-center gap-10">
                <span className="whitespace-nowrap font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-navy/70">
                  {sector}
                </span>
                <span className="h-1 w-1 shrink-0 rotate-45 bg-gold" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
