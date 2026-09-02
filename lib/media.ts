/**
 * Every image slot on the site, in one place.
 *
 * No slot has a photograph yet, so each one renders a plain technical
 * placeholder (components/art/TechnicalField). Sections that would look empty
 * as a row of placeholders check `hasPhotography` and render their
 * typographic layout instead — the page never depends on imagery it does not
 * have.
 *
 * To use a real photograph, drop the file in /public/work and set `src`:
 *
 *   caseMain: { ..., src: "/work/hangar-exterior.jpg", alt: "…" }
 *
 * `note` is the art direction for that slot: what to shoot, and in what shape.
 */
export type MediaSlot = {
  id: string;
  alt: string;
  /** Short label shown on the placeholder and as an overlay chip. */
  label: string;
  note: string;
  src?: string;
};

export const media = {
  heroPrimary: {
    id: "heroPrimary",
    alt: "JVS Painting crew at work on a commercial facility",
    label: "Facility exterior",
    note: "The one hero photograph. Landscape 3:2, shot wide with quiet space on the left third for the headline. A real crew on a real building — no stock.",
  },
  caseMain: {
    id: "caseMain",
    alt: "Facility exterior at a New Jersey military installation",
    label: "Facility exterior",
    note: "Featured project. Landscape 4:3, straight-on, whole structure in frame. Clear it with the facility before publishing.",
  },
  caseDetail: {
    id: "caseDetail",
    alt: "Crew preparing and coating a wall on site",
    label: "Crew at work",
    note: "Portrait 3:4. Two or three of the crew working — hands, rollers, masking.",
  },
  workExterior: {
    id: "workExterior",
    alt: "Multi-story facade being repainted",
    label: "Facades & exteriors",
    note: "Capability tile, landscape 3:2.",
  },
  workIndustrial: {
    id: "workIndustrial",
    alt: "Warehouse interior coating in progress",
    label: "Warehouse & industrial",
    note: "Capability tile, landscape 3:2.",
  },
  workStructures: {
    id: "workStructures",
    alt: "Elevated tank or structural steel being recoated",
    label: "Tanks & structures",
    note: "Capability tile, landscape 3:2.",
  },
  workInterior: {
    id: "workInterior",
    alt: "Interior repaint in an occupied building",
    label: "Occupied interiors",
    note: "Capability tile, landscape 3:2.",
  },
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;

/** True once any slot has a real photograph behind it. */
export const hasPhotography = Object.values(media as Record<string, MediaSlot>).some(
  (slot) => Boolean(slot.src)
);
