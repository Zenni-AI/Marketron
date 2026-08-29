"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Status = "idle" | "loading" | "success" | "error";

const PROJECT_TYPES = [
  "Government Contract",
  "Commercial",
  "Other",
] as const;

const inputClasses =
  "w-full rounded-md border border-line bg-white px-4 py-3 font-sans text-[15px] text-blueDeep placeholder:text-steel/50 outline-none transition-all duration-200 ease-premium hover:border-steel/40 focus:border-red focus:shadow-focus-red";

const labelClasses =
  "mb-2 block font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-blueDeep";

export default function BidForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Request failed.");
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.message
          ? `${error.message} You can also reach us at 856-461-5888.`
          : "Something went wrong sending your request. Please call 856-461-5888 and we'll take the details by phone."
      );
    }
  }

  return (
    <div className="relative">
      {/* Red/blue gradient hairline giving the card its own edge treatment. */}
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-[15px] bg-[linear-gradient(140deg,#B31942_0%,#0A2647_45%,#14396B_100%)] opacity-90"
      />

      <div className="relative rounded-card bg-white p-6 shadow-elevated sm:p-9 lg:p-11">
        <AnimatePresence mode="wait" initial={false}>
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-[420px] flex-col items-center justify-center px-2 text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blueDeep"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </motion.div>
              <h3 className="text-2xl md:text-3xl">Request received</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-steel">
                Thank you — your bid request is in. A member of the JVS Painting
                team will follow up promptly with a formal quote. For anything
                time-sensitive, call{" "}
                <a
                  href="tel:+18564615888"
                  className="font-bold text-red underline-offset-4 hover:underline"
                >
                  856-461-5888
                </a>
                .
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-8 font-sans text-xs font-bold uppercase tracking-[0.14em] text-blueDeep underline-offset-4 transition-colors duration-150 hover:text-red hover:underline"
              >
                Submit another request
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              noValidate={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Name" htmlFor="name" required>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className={inputClasses}
                  />
                </Field>

                <Field label="Organization / Agency" htmlFor="organization">
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    autoComplete="organization"
                    placeholder="Agency, company or property group"
                    className={inputClasses}
                  />
                </Field>

                <Field label="Email" htmlFor="email" required>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@organization.gov"
                    className={inputClasses}
                  />
                </Field>

                <Field label="Phone" htmlFor="phone" required>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="(856) 555-0100"
                    className={inputClasses}
                  />
                </Field>

                <Field label="Project Type" htmlFor="projectType" required>
                  <div className="relative">
                    <select
                      id="projectType"
                      name="projectType"
                      required
                      defaultValue=""
                      className={`${inputClasses} appearance-none pr-10`}
                    >
                      <option value="" disabled>
                        Select a project type
                      </option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-steel"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </Field>

                <Field label="Project Location" htmlFor="location" required>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    placeholder="City, state or facility name"
                    className={inputClasses}
                  />
                </Field>
              </div>

              <Field label="Estimated Timeline" htmlFor="timeline">
                <input
                  id="timeline"
                  name="timeline"
                  type="text"
                  placeholder="e.g. Q2 start, 6-week window, or ASAP"
                  className={inputClasses}
                />
              </Field>

              <Field label="Project Details" htmlFor="details" required>
                <textarea
                  id="details"
                  name="details"
                  rows={5}
                  required
                  placeholder="Square footage, surfaces, site access and security requirements, prevailing wage, or anything else we should price against."
                  className={`${inputClasses} resize-y leading-relaxed`}
                />
              </Field>

              {status === "error" && (
                <p
                  role="alert"
                  className="rounded-md border border-red/25 bg-red/5 px-4 py-3 text-sm leading-relaxed text-redDeep"
                >
                  {errorMessage}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-red w-full px-8 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-3">
                      <Spinner />
                      Sending Request
                    </span>
                  ) : (
                    "Submit Bid Request"
                  )}
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-steel">
                  We respond to every request. Prefer to talk it through? Call{" "}
                  <a
                    href="tel:+18564615888"
                    className="font-bold text-blueDeep underline-offset-4 hover:text-red hover:underline"
                  >
                    856-461-5888
                  </a>
                  .
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
        {required && <span className="ml-1 text-red">*</span>}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
