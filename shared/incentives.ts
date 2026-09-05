/**
 * Incentive assumptions used by the savings estimate.
 *
 * IMPORTANT - keep this file current, it is the part of the model most likely
 * to go stale, and the numbers here are shown to consumers.
 *
 * The federal Residential Clean Energy Credit (IRC section 25D) - the "30%
 * solar tax credit" that most marketing copy still quotes - was terminated for
 * expenditures made after December 31, 2025. A homeowner buying a system with
 * cash or a loan in 2026 therefore claims nothing under 25D, which is why
 * `federalPurchaseCreditRate` defaults to 0 here rather than 0.30. Quoting an
 * expired credit in a lead funnel is both a conversion problem (the estimate
 * collapses on the sales call) and a compliance problem.
 *
 * Third-party-owned systems (lease / PPA) are a separate question: the credit
 * is claimed by the system owner at the business level, not the homeowner, so
 * it shows up as a lower monthly payment rather than a tax refund. Model that
 * in your lease pricing, not here.
 *
 * If your compliance team confirms a different figure, change it in one place.
 */
export interface IncentiveConfig {
  /** Fraction of gross system cost credited back on a cash/loan purchase. */
  federalPurchaseCreditRate: number;
  /** Short line shown under the estimate explaining the federal position. */
  federalNote: string;
  /** Annual utility rate escalation used for lifetime savings. */
  utilityEscalation: number;
  /** Annual panel output degradation. */
  panelDegradation: number;
  /** Years of savings modelled in the lifetime figure. */
  analysisYears: number;
}

export const INCENTIVES: IncentiveConfig = {
  federalPurchaseCreditRate: 0,
  federalNote:
    'The federal residential solar tax credit (Section 25D) ended for systems purchased after December 31, 2025, so this estimate does not assume one. State, utility, and lease/PPA incentives still apply and are included where available.',
  utilityEscalation: 0.025,
  panelDegradation: 0.005,
  analysisYears: 25,
};

/** Hardware assumptions. Update when your standard panel changes. */
export const SYSTEM = {
  panelWatts: 400,
  /** Losses from inverter, wiring, soiling, temperature - PVWatts default. */
  systemDerate: 0.8,
  /** Share of the home's annual usage a standard design targets. */
  targetOffset: 0.95,
  /** lbs of CO2 avoided per kWh of grid power displaced (EPA US average). */
  co2PoundsPerKwh: 0.85,
  /** lbs of CO2 a mature tree sequesters per year. */
  co2PoundsPerTreeYear: 48,
} as const;
