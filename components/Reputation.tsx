"use client";

import AnimatedCounter from "./AnimatedCounter";
import Media from "./Media";
import Texture from "./Texture";
import { Reveal } from "./Section";

/**
 * Full-bleed band: the forty-year statement set over a photograph rather than
 * on flat white — this is the emotional beat of the page.
 */
export default function Reputation() {
  return (
    <section id="reputation" className="relative overflow-hidden bg-blueDeep">
      <div className="absolute inset-0">
        <Media
          slot="reputationBand"
          scrim="heavy"
          rounded={false}
          parallax
          sizes="100vw"
          className="h-full w-full"
        />
      </div>
      {/* The band art is busy by design — hold it back so the type wins. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,20,40,0.93)_0%,rgba(8,28,54,0.86)_55%,rgba(10,38,71,0.78)_100%)]"
      />
      <Texture opacity={0.28} />

      <div className="relative mx-auto w-full max-w-content px-5 py-20 sm:px-8 md:py-section-lg lg:px-10">
        <div className="grid items-start gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-4 top-2 h-[calc(100%-1rem)] w-1 rounded-full bg-red-gradient md:-left-8"
            />
            <AnimatedCounter
              value={40}
              suffix="+"
              label="Years of Finished Work"
              size="lg"
              tone="dark"
            />
          </div>

          <div>
            <Reveal>
              <h2 className="text-display-sm text-balance text-white md:text-display-md">
                If it needs to get done right, we&rsquo;ve already done it.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-prose text-base leading-[1.8] text-white/75 md:text-lg">
                JVS Painting Inc. has spent over 40 years building a reputation
                with entities that don&rsquo;t have room for error — government
                installations, large commercial properties, and organizations
                that need a contractor who shows up, follows through, and
                delivers finished work that holds up to inspection. That track
                record is why we&rsquo;re trusted for contracts where the
                stakes — and the standards — are higher than average.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
