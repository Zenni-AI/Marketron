"use client";

import Media from "./Media";
import Texture from "./Texture";
import StripeDivider from "./StripeDivider";
import { Reveal } from "./Section";

const facts = [
  { label: "Client Type", value: "Military Installation" },
  { label: "Scope", value: "Facility Painting" },
  { label: "Location", value: "New Jersey" },
];

export default function CaseStudy() {
  return (
    <section id="project" className="relative overflow-hidden bg-blueDeep">
      <StripeDivider tone="dark" className="h-14 w-full opacity-80 md:h-20" />
      <Texture opacity={0.26} />

      <div className="relative mx-auto w-full max-w-content px-5 py-16 sm:px-8 md:py-24 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-20">
          {/* Three-frame collage — a big plate with two overlapping insets. */}
          <div className="relative">
            <Media
              slot="caseMain"
              aspect="aspect-[4/3]"
              showLabel
              parallax
              className="shadow-elevated ring-1 ring-white/12"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />

            <Media
              slot="caseDetail"
              aspect="aspect-[3/4]"
              showLabel
              className="absolute -bottom-10 -right-3 w-[38%] shadow-elevated ring-1 ring-white/15 sm:-right-8 sm:w-[34%]"
              sizes="25vw"
            />

            <Media
              slot="caseFinish"
              aspect="aspect-square"
              className="absolute -left-3 -top-10 hidden w-[26%] shadow-elevated ring-1 ring-white/20 sm:block"
              sizes="20vw"
            />
          </div>

          <div className="pt-14 lg:pt-0">
            <Reveal>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-[3px] w-10 bg-red" />
                <p className="eyebrow text-white/60">Featured Project</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-display-sm text-balance text-white md:text-display-md">
                Joint Base McGuire-Dix-Lakehurst
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-7 space-y-6 text-base leading-[1.8] text-white/70 md:text-lg">
                <p>
                  Commercial-grade painting services delivered for one of New
                  Jersey&rsquo;s major military installations — one example of
                  the caliber of work JVS Painting has provided for over four
                  decades.
                </p>
                <p className="border-l-2 border-red pl-5 font-display text-xl leading-[1.6] text-white md:text-2xl">
                  Work of this scale requires more than a paint crew: it takes a
                  contractor who understands security protocols, scheduling
                  constraints, and the standard of finish a government facility
                  expects.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <dl className="mt-11 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-white/12 bg-white/12 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="bg-blueDeep px-6 py-5 transition-colors duration-250 ease-premium hover:bg-blueMid"
                  >
                    <dt className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-white">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>

      <StripeDivider
        tone="dark"
        className="h-14 w-full rotate-180 opacity-80 md:h-20"
      />
    </section>
  );
}
