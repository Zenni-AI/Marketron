"use client";

import BidForm from "./BidForm";
import { Reveal } from "./Section";
import { BID_FORM_ID } from "@/lib/scroll";

export default function BidSection() {
  return (
    <section
      id={BID_FORM_ID}
      className="relative overflow-hidden bg-offWhite py-20 md:py-section-lg"
    >
      {/* Subtle gold/blue wash marking this as the conversion point. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(31,41,93,0.10),transparent_55%),radial-gradient(ellipse_at_85%_100%,rgba(255,205,5,0.12),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#FFCD05_20%,#1F295D_80%,transparent)] opacity-40"
      />

      <div className="relative mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow mb-5 text-navy">Start Here</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-display-sm text-balance md:text-display-md">
              Request Your Bid
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-base leading-[1.75] text-steel md:text-lg">
              Tell us about the project — we&rsquo;ll follow up promptly with a
              formal quote.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mx-auto mt-12 max-w-3xl md:mt-14">
          <BidForm />
        </Reveal>
      </div>
    </section>
  );
}
