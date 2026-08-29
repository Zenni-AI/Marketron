"use client";

import AnimatedCounter from "./AnimatedCounter";
import Section, { Reveal } from "./Section";

export default function Reputation() {
  return (
    <Section id="reputation" tone="tinted" size="lg">
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
          />
        </div>

        <div>
          <Reveal>
            <h2 className="text-display-sm text-balance md:text-display-md">
              If it needs to get done right, we&rsquo;ve already done it.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-prose text-base leading-[1.8] text-steel md:text-lg">
              JVS Painting Inc. has spent over 40 years building a reputation
              with entities that don&rsquo;t have room for error — government
              installations, large commercial properties, and organizations that
              need a contractor who shows up, follows through, and delivers
              finished work that holds up to inspection. That track record is
              why we&rsquo;re trusted for contracts where the stakes — and the
              standards — are higher than average.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
