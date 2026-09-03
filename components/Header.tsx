"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { BID_FORM_ID, scrollToId } from "@/lib/scroll";

const PHONE = "856-461-5888";
const PHONE_HREF = "tel:+18564615888";

/**
 * Transparent over the hero, solid white once the page scrolls. The two states
 * cross-fade rather than snap.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ease-premium ${
        scrolled
          ? "border-b border-line bg-white/95 shadow-[0_1px_20px_-8px_rgba(10,38,71,0.25)] backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[84px] w-full max-w-content sm:h-[92px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <a
          href="#top"
          className="flex items-center transition-opacity duration-250 hover:opacity-80"
          aria-label="J.V.S. Painting — back to top"
        >
          {/* Two variants rather than a filter: the knockout keeps the gold
              while turning the navy to white for the transparent state. */}
          <Logo
            variant={scrolled ? "navy" : "knockout"}
            priority
            className="h-12 sm:h-16"
          />
        </a>

        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href={PHONE_HREF}
            className={`hidden font-sans text-sm font-bold tracking-wide transition-colors duration-250 sm:inline-flex sm:items-center sm:gap-2 ${
              scrolled
                ? "text-navy hover:text-navyMid"
                : "text-white hover:text-white/70"
            }`}
          >
            <PhoneIcon />
            {PHONE}
          </a>

          <a
            href={PHONE_HREF}
            aria-label={`Call JVS Painting at ${PHONE}`}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-250 sm:hidden ${
              scrolled
                ? "border-line text-navy"
                : "border-white/30 text-white"
            }`}
          >
            <PhoneIcon />
          </a>

          <button
            type="button"
            onClick={() => scrollToId(BID_FORM_ID)}
            className="btn-primary whitespace-nowrap px-4 py-2.5 text-[11px] sm:px-6 sm:py-3 sm:text-sm"
          >
            <span className="hidden sm:inline">Submit a Bid Request</span>
            <span className="sm:hidden">Bid Request</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
