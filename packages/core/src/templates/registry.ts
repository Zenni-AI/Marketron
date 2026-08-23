import type { Template } from "../types/template";

/**
 * v1 ships a single template. New templates are added here as data — the
 * renderer (@marketron/renderer) reads every visual decision (caption style/
 * position, logo placement, transition type, hook duration) from the
 * Template object, so adding one never requires touching render code.
 */
export const beforeAfterHookTemplate: Template = {
  id: "before-after-hook",
  name: "Before/After Hook",
  description:
    "Opens on the strongest hook moment, contrasts a before/after pair, closes on a branded logo card. Best for jobs with clear before/after photos or clips.",
  maxClips: 18,
  captionStyle: {
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    fontSizePct: 6,
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.55)",
    position: "bottom",
  },
  logoPosition: "bottom-right",
  logoSizePct: 12,
  defaultTransition: { type: "slide", durationSec: 0.45 },
  hookDurationSec: 2,
};

export const TEMPLATE_REGISTRY: Record<string, Template> = {
  [beforeAfterHookTemplate.id]: beforeAfterHookTemplate,
};

export function listTemplates(): Template[] {
  return Object.values(TEMPLATE_REGISTRY);
}

export function getTemplate(id: string): Template | undefined {
  return TEMPLATE_REGISTRY[id];
}
