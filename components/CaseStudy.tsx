"use client";

import Media from "./Media";
import { Reveal } from "./Section";
import { IconCheck } from "./art/Icons";
import { hasPhotography } from "@/lib/media";

const demands = [
  "Site access under facility security protocols",
  "Sequencing around active base operations",
  "Finish held to government inspection standards",
];

const record = [
  ["Client type", "Military installation"],
  ["Scope", "Facility painting"],
  ["Location", "New Jersey"],
  ["Contract basis", "Commercial-grade specification"],
];

/**
 * The featured project, presented as a record rather than a showcase: the
 * facts first, then what the work required.
 */
export default function CaseStudy() {
  return (
    <section id="project" className="relative bg-offWhite py-16 md:py-section">
      <div className="mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Reveal>
              <div className="mb-5 flex items-center gap-4">
                <span className="h-[3px] w-10 bg-gold" />
                <p className="eyebrow text-navy">Featured Project</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-display-sm text-balance md:text-display-md">
                Joint Base McGuire-Dix-Lakehurst
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-7 space-y-6 text-base leading-[1.8] text-steel md:text-lg">
                <p>
                  Commercial-grade painting services delivered for one of New
                  Jersey&rsquo;s major military installations — one example of
                  the caliber of work JVS Painting has provided for over four
                  decades.
                </p>
                <p className="border-l-[3px] border-gold bg-white py-5 pl-6 pr-5 font-display text-xl leading-[1.55] text-navy shadow-card md:text-2xl">
                  Work of this scale requires more than a paint crew: it takes a
                  contractor who understands security protocols, scheduling
                  constraints, and the standard of finish a government facility
                  expects.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:pt-4">
            <Reveal delay={0.12}>
              <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
                <div className="border-b border-line bg-navy px-6 py-4 sm:px-7">
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                    Project Record
                  </h3>
                </div>
                <dl className="divide-y divide-line">
                  {record.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-6 px-6 py-4 sm:px-7"
                    >
                      <dt className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-steel">
                        {label}
                      </dt>
                      <dd className="text-right text-[15px] font-bold text-navy">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-6 rounded-card border border-line bg-white p-6 shadow-card sm:p-7">
                <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-steel">
                  What the work required
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {demands.map((demand) => (
                    <li key={demand} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-gold"
                      >
                        <IconCheck className="h-3 w-3" />
                      </span>
                      <span className="text-[15px] leading-relaxed text-navy">
                        {demand}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {hasPhotography && (
              <Reveal delay={0.18}>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <Media
                    slot="caseMain"
                    aspect="aspect-[4/3]"
                    showLabel
                    className="col-span-2 ring-1 ring-line"
                    sizes="35vw"
                  />
                  <Media
                    slot="caseDetail"
                    aspect="aspect-[3/4]"
                    className="ring-1 ring-line"
                    sizes="20vw"
                  />
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
