import type { PlateName } from "@/components/art/Plates";

/**
 * Every image slot on the site, in one place.
 *
 * Each slot currently renders a hand-drawn plate (see components/art/Plates).
 * To use a real photograph instead, drop the file in /public/work and set
 * `src` — nothing else changes. Keep `alt` accurate to whatever is shown.
 *
 *   { ..., src: "/work/hangar-exterior.jpg", alt: "Crew coating a hangar door" }
 *
 * `note` is the art direction for that slot: what to shoot, and in what shape.
 */
export type MediaSlot = {
  id: string;
  plate: PlateName;
  alt: string;
  /** Short overlay label. Keep it descriptive of the work, not a claim. */
  label?: string;
  note: string;
  src?: string;
  tone?: "night" | "plaster";
};

export const media = {
  heroBackdrop: {
    id: "heroBackdrop",
    plate: "lift",
    alt: "Painter working from a boom lift against a tall exterior wall",
    note: "Fills the right half of the hero, so it is cropped TALL. A worker at height with a lot of wall around them — scale is the point. Shoot late afternoon.",
  },
  heroMobile: {
    id: "heroMobile",
    plate: "facade",
    alt: "Commercial building under scaffold during an exterior repaint",
    note: "The hero picture on phones — landscape 16:10, a scaffolded building mid-job.",
  },
  heroInset: {
    id: "heroInset",
    plate: "crew",
    alt: "Crew rolling out a wall with drop cloths down",
    label: "Crew at work",
    note: "Small portrait frame overlapping the hero seam. People and hands, close in.",
  },
  serviceGovernment: {
    id: "serviceGovernment",
    plate: "hangar",
    alt: "Aircraft maintenance hangar at a military installation",
    note: "Landscape 3:2. Hangar, barracks or admin building on an installation. No identifiable security detail.",
  },
  serviceCommercial: {
    id: "serviceCommercial",
    plate: "warehouse",
    alt: "Warehouse interior with racking and a lift set up for painting",
    note: "Landscape 3:2. Warehouse or big-box interior, lift staged, floor protected.",
  },
  caseMain: {
    id: "caseMain",
    plate: "hangar",
    alt: "Hangar exterior at a New Jersey military installation",
    label: "Facility exterior",
    note: "The hero shot of the featured project. Landscape 4:3, straight-on, the whole structure in frame.",
  },
  caseDetail: {
    id: "caseDetail",
    plate: "crew",
    alt: "Crew cutting in a wall with drop cloths down",
    label: "Crew at work",
    note: "Portrait 3:4. Two or three of the crew working — hands, rollers, masking.",
  },
  caseFinish: {
    id: "caseFinish",
    plate: "detail",
    alt: "Close detail of a finished coated surface",
    label: "Finish",
    note: "Square macro of the finished surface — the edge quality is the sell.",
    tone: "plaster" as const,
  },
  workFacade: {
    id: "workFacade",
    plate: "facade",
    alt: "Multi-story facade being repainted from scaffold",
    label: "Facade & exteriors",
    note: "Gallery frame, portrait 4:5.",
  },
  workWarehouse: {
    id: "workWarehouse",
    plate: "warehouse",
    alt: "Industrial warehouse interior painting",
    label: "Warehouse & industrial",
    note: "Gallery frame, portrait 4:5.",
  },
  workTower: {
    id: "workTower",
    plate: "watertower",
    alt: "Elevated water tank being recoated",
    label: "Tanks & structures",
    note: "Gallery frame, portrait 4:5.",
  },
  workSteel: {
    id: "workSteel",
    plate: "steel",
    alt: "Structural steel being coated from a suspended stage",
    label: "Structural steel",
    note: "Gallery frame, portrait 4:5.",
  },
  workCrew: {
    id: "workCrew",
    plate: "crew",
    alt: "Interior repaint in progress",
    label: "Interiors",
    note: "Gallery frame, portrait 4:5.",
  },
  reputationBand: {
    id: "reputationBand",
    plate: "steel",
    alt: "Coated structural steel spanning a facility",
    note: "Full-bleed band behind the 40-year statement. Wide and dark, low detail — type sits on top.",
  },
} satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;
