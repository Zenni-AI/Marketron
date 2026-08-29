"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BID_FORM_ID, scrollToId } from "@/lib/scroll";

/**
 * Slim bar that slides in once the hero has scrolled past, and steps back out
 * while the bid form itself is on screen so it never covers the fields.
 */
export default function StickyCTABar() {
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.85);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const target = document.getElementById(BID_FORM_ID);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { rootMargin: "-10% 0px -10% 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const visible = pastHero && !formVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={prefersReduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { y: "100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-blueDeep/95 backdrop-blur"
        >
          <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="hidden h-8 w-1 shrink-0 rounded-full bg-red sm:block"
              />
              <p className="truncate font-display text-base text-white sm:text-lg">
                Ready to submit a bid?
              </p>
            </div>
            <button
              type="button"
              onClick={() => scrollToId(BID_FORM_ID)}
              className="btn-red shrink-0 px-4 py-2.5 text-[11px] sm:px-6 sm:text-sm"
            >
              <span className="hidden sm:inline">Submit a Bid Request</span>
              <span className="sm:hidden">Get Started</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
