import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blueDeep: "#0A2647",
        blueMid: "#14396B",
        red: "#B31942",
        redDeep: "#8C1332",
        white: "#FFFFFF",
        offWhite: "#F7F8FA",
        steel: "#4A5568",
        line: "#E2E5EA",
      },
      fontFamily: {
        // System stacks only — no webfont request, so no font-related layout shift.
        display: ['Georgia', '"Times New Roman"', "Times", "serif"],
        sans: ["Arial", '"Helvetica Neue"', "Helvetica", "sans-serif"],
      },
      fontSize: {
        // Type scale used across the page.
        eyebrow: ["0.75rem", { lineHeight: "1.1", letterSpacing: "0.18em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        "display-md": ["3rem", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
      },
      spacing: {
        section: "7rem",
        "section-lg": "9.5rem",
      },
      maxWidth: {
        content: "1200px",
        prose: "68ch",
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 38, 71, 0.04), 0 12px 32px -12px rgba(10, 38, 71, 0.14)",
        "card-hover":
          "0 2px 4px rgba(10, 38, 71, 0.06), 0 28px 56px -18px rgba(10, 38, 71, 0.28)",
        elevated:
          "0 2px 6px rgba(10, 38, 71, 0.05), 0 40px 80px -28px rgba(10, 38, 71, 0.35)",
        "focus-red": "0 0 0 3px rgba(179, 25, 66, 0.16)",
        "focus-blue": "0 0 0 3px rgba(20, 57, 107, 0.16)",
      },
      transitionDuration: {
        "150": "150ms",
        "250": "250ms",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(160deg, #0A2647 0%, #0A2647 38%, #14396B 100%)",
        "blue-gradient": "linear-gradient(135deg, #0A2647 0%, #14396B 100%)",
        "red-gradient": "linear-gradient(135deg, #B31942 0%, #8C1332 100%)",
      },
      keyframes: {
        "stripe-draw": {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 42s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
