export const BID_FORM_ID = "bid-request";

/**
 * Scroll an in-page target into view. Honors prefers-reduced-motion by
 * jumping instead of animating, and falls back to a hash change if the
 * target is not mounted yet.
 */
export function scrollToId(id: string) {
  if (typeof window === "undefined") return;

  const target = document.getElementById(id);
  if (!target) {
    window.location.hash = `#${id}`;
    return;
  }

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  target.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
  });
}
