import { STATES, profileFromZip, type StateProfile } from './geo.ts';
import { INCENTIVES, SYSTEM } from './incentives.ts';
import type {
  CreditBand, FitResult, FitTier, QualifierAnswers, SavingsEstimate,
  ScoreFactor, ShadeLevel, RoofAge, RoofDirection, Timeline,
} from './types.ts';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const round = (n: number, places = 0) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/**
 * How much of a full-sun array each factor delivers, 0..1.
 * Shade and orientation also physically derate production, so they are reused
 * by the savings estimate below - a heavily shaded north roof should not be
 * quoted the same output as a clear south roof.
 */
const SHADE_FACTOR: Record<ShadeLevel, number> = { none: 1.0, light: 0.92, moderate: 0.74, heavy: 0.5 };
const SHADE_SCORE: Record<ShadeLevel, number> = { none: 1.0, light: 0.82, moderate: 0.48, heavy: 0.12 };
const DIRECTION_FACTOR: Record<RoofDirection, number> = {
  south: 1.0, southeast_southwest: 0.95, east_west: 0.85, north: 0.68, flat: 0.9, not_sure: 0.9,
};
const DIRECTION_SCORE: Record<RoofDirection, number> = {
  south: 1.0, southeast_southwest: 0.9, east_west: 0.72, north: 0.35, flat: 0.85, not_sure: 0.75,
};
const ROOF_AGE_SCORE: Record<RoofAge, number> = { under_10: 1.0, '10_to_20': 0.8, over_20: 0.4, not_sure: 0.7 };
const CREDIT_SCORE: Record<CreditBand, number> = { excellent: 1.0, good: 0.85, fair: 0.55, poor: 0.2, not_sure: 0.6 };
const TIMELINE_SCORE: Record<Timeline, number> = { asap: 1.0, '1_to_3_months': 0.85, '3_to_6_months': 0.6, researching: 0.35 };

/** Weights sum to 100 so `score` reads directly as a percentage. */
const WEIGHTS = {
  bill: 24,
  rate: 19,
  sun: 17,
  shade: 19,
  direction: 8,
  policy: 8,
  roofAge: 5,
} as const;

function resolveState(answers: QualifierAnswers): (StateProfile & { code: string }) | null {
  if (answers.stateOverride) {
    const code = answers.stateOverride.toUpperCase();
    const profile = STATES[code];
    if (profile) return { ...profile, code };
  }
  return profileFromZip(answers.zip);
}

/**
 * Size a system from the bill, then project production, savings, and payback.
 *
 * Usage is inferred from the bill and the local retail rate, which is how every
 * online estimator works when it has no utility data. It is deliberately
 * conservative: production is derated for shade and orientation, and savings
 * are capped at the homeowner's actual bill so we never promise more back than
 * they currently spend.
 */
export function estimateSavings(answers: QualifierAnswers, state: StateProfile): SavingsEstimate {
  const annualUsageKwh = (answers.monthlyBill / state.rate) * 12;

  const productionPerKw = state.sunHours * 365 * SYSTEM.systemDerate
    * SHADE_FACTOR[answers.shade] * DIRECTION_FACTOR[answers.roofDirection];

  const systemSizeKw = round((annualUsageKwh * SYSTEM.targetOffset) / productionPerKw, 1);
  const panelCount = Math.ceil((systemSizeKw * 1000) / SYSTEM.panelWatts);
  const annualProductionKwh = Math.round(systemSizeKw * productionPerKw);

  const grossCost = Math.round(systemSizeKw * 1000 * state.costPerWatt);
  const federalCredit = Math.round(grossCost * INCENTIVES.federalPurchaseCreditRate);
  const netCost = grossCost - federalCredit;

  // Exports are usually worth less than the retail rate, so blend the retail
  // rate for self-consumed power with the state's policy quality for the rest.
  const selfConsumedShare = 0.55;
  const exportValue = state.rate * (0.35 + 0.65 * state.policy);
  const effectiveRate = state.rate * selfConsumedShare + exportValue * (1 - selfConsumedShare);

  const annualBill = answers.monthlyBill * 12;
  const firstYearSavings = Math.round(Math.min(annualProductionKwh * effectiveRate, annualBill));

  let lifetimeSavings = 0;
  for (let year = 0; year < INCENTIVES.analysisYears; year++) {
    const escalation = (1 + INCENTIVES.utilityEscalation) ** year;
    const degradation = (1 - INCENTIVES.panelDegradation) ** year;
    lifetimeSavings += firstYearSavings * escalation * degradation;
  }
  lifetimeSavings = Math.round(lifetimeSavings - netCost);

  const paybackYears = firstYearSavings > 0 ? round(netCost / firstYearSavings, 1) : null;
  const co2PoundsPerYear = Math.round(annualProductionKwh * SYSTEM.co2PoundsPerKwh);

  return {
    systemSizeKw,
    panelCount,
    annualProductionKwh,
    annualUsageKwh: Math.round(annualUsageKwh),
    offsetPercent: Math.min(100, Math.round((annualProductionKwh / annualUsageKwh) * 100)),
    grossCost,
    federalCredit,
    netCost,
    firstYearSavings,
    monthlySavings: Math.round(firstYearSavings / 12),
    lifetimeSavings,
    paybackYears,
    co2PoundsPerYear,
    treesEquivalent: Math.round(co2PoundsPerYear / SYSTEM.co2PoundsPerTreeYear),
  };
}

function tierFor(score: number): FitTier {
  if (score >= 78) return 'excellent';
  if (score >= 62) return 'strong';
  if (score >= 46) return 'moderate';
  return 'limited';
}

const TIER_COPY: Record<FitTier, { headline: string; summary: string }> = {
  excellent: {
    headline: 'Your home is an excellent fit for solar',
    summary: 'Strong sun, a bill worth offsetting, and a roof that can take a full-size system. Homes that score in this range usually see the fastest payback in their area.',
  },
  strong: {
    headline: 'Your home is a strong fit for solar',
    summary: 'The numbers work well here. A standard rooftop system should cover most of your usage and pay for itself comfortably inside the warranty period.',
  },
  moderate: {
    headline: 'Solar can work at your home',
    summary: 'You are in workable territory - the savings are real, but the design matters. A specialist should look at your roof and rate plan before you commit.',
  },
  limited: {
    headline: 'Solar is a closer call at your home',
    summary: 'One or two factors are working against you right now. It is worth a conversation, but be sceptical of anyone who quotes you before looking at the details below.',
  },
  not_yet: {
    headline: 'Rooftop solar is not the right fit yet',
    summary: 'Rooftop solar needs a roof you own and control. There is still a way to cut your power bill - see below.',
  },
};

/** Sales routing bucket. Fit alone is not enough; intent and bill size matter. */
export function priorityFor(score: number, answers: QualifierAnswers): 'hot' | 'warm' | 'nurture' {
  if (answers.propertyType === 'rent') return 'nurture';
  const intent = TIMELINE_SCORE[answers.timeline];
  const financeable = CREDIT_SCORE[answers.creditBand] >= 0.55;
  if (score >= 62 && intent >= 0.85 && answers.monthlyBill >= 120 && financeable) return 'hot';
  if (score >= 46 && intent >= 0.6) return 'warm';
  return 'nurture';
}

/** Run the full qualifier: score the home, size a system, and explain both. */
export function evaluate(answers: QualifierAnswers): FitResult {
  const state = resolveState(answers);
  if (!state) {
    throw new Error(`Could not resolve a US state for ZIP code "${answers.zip}"`);
  }
  const stateInfo = { code: state.code, name: state.name, policyNote: state.policyNote };

  // Renting is a hard gate: you cannot put a 25-year asset on someone else's
  // roof. Route them to community solar instead of scoring them out silently.
  if (answers.propertyType === 'rent') {
    return {
      score: 0,
      tier: 'not_yet',
      qualified: false,
      ...TIER_COPY.not_yet,
      factors: [],
      strengths: [],
      watchouts: ['Rooftop solar requires ownership of the property.'],
      state: stateInfo,
      estimate: null,
      alternative: {
        headline: 'Community solar may still cut your bill',
        body: `Community solar lets renters in ${state.name} subscribe to a share of a local solar farm and take the credit straight off their utility bill - no roof and no installation required. Leave your details and we will tell you whether a project is open in your area.`,
      },
    };
  }

  const factors: ScoreFactor[] = [
    {
      key: 'bill',
      label: 'Electricity usage',
      value: clamp01((answers.monthlyBill - 60) / (350 - 60)),
      maxPoints: WEIGHTS.bill,
      points: 0,
      detail: `$${answers.monthlyBill}/month bill. The bigger the bill, the more there is for solar to offset.`,
    },
    {
      key: 'rate',
      label: 'Local power prices',
      value: clamp01((state.rate - 0.1) / (0.3 - 0.1)),
      maxPoints: WEIGHTS.rate,
      points: 0,
      detail: rateDetail(state),
    },
    {
      key: 'sun',
      label: 'Sunlight in your area',
      value: clamp01((state.sunHours - 3.5) / (6.5 - 3.5)),
      maxPoints: WEIGHTS.sun,
      points: 0,
      detail: sunDetail(state),
    },
    {
      key: 'shade',
      label: 'Roof shading',
      value: SHADE_SCORE[answers.shade],
      maxPoints: WEIGHTS.shade,
      points: 0,
      detail: shadeDetail(answers.shade),
    },
    {
      key: 'direction',
      label: 'Roof orientation',
      value: DIRECTION_SCORE[answers.roofDirection],
      maxPoints: WEIGHTS.direction,
      points: 0,
      detail: directionDetail(answers.roofDirection),
    },
    {
      key: 'policy',
      label: 'Local solar policy',
      value: state.policy,
      maxPoints: WEIGHTS.policy,
      points: 0,
      detail: state.policyNote,
    },
    {
      key: 'roofAge',
      label: 'Roof condition',
      value: ROOF_AGE_SCORE[answers.roofAge],
      maxPoints: WEIGHTS.roofAge,
      points: 0,
      detail: roofAgeDetail(answers.roofAge),
    },
  ];

  for (const factor of factors) {
    factor.points = round(factor.value * factor.maxPoints, 1);
  }

  const score = Math.round(factors.reduce((sum, f) => sum + f.points, 0));
  const tier = tierFor(score);

  const strengths = factors
    .filter((f) => f.value >= 0.7)
    .sort((a, b) => b.points - a.points)
    .map((f) => f.detail);

  const watchouts = factors
    .filter((f) => f.value < 0.5)
    .sort((a, b) => a.value - b.value)
    .map((f) => f.detail);

  if (answers.roofAge === 'over_20') {
    watchouts.push('Panels last 25+ years. Re-roofing first avoids paying to remove and reinstall the array later.');
  }
  if (answers.propertyType === 'business') {
    strengths.push('Commercial properties can depreciate the system, which is not available to homeowners.');
  }

  return {
    score,
    tier,
    qualified: true,
    ...TIER_COPY[tier],
    factors,
    strengths,
    watchouts,
    state: stateInfo,
    estimate: estimateSavings(answers, state),
  };
}

/**
 * Factor details are surfaced twice - once in the score breakdown, and again
 * under "working in your favour" or "worth knowing before you buy". So each one
 * has to carry its own implication: a bare statistic reads as a non-sequitur
 * when it appears beneath a warning icon.
 */
const US_AVERAGE_SUN_HOURS = 4.7;
const US_AVERAGE_RATE = 0.17;

function sunDetail(state: StateProfile): string {
  const lead = `About ${state.sunHours} peak sun hours a day in ${state.name}`;
  if (state.sunHours >= 5.5) return `${lead} - among the best solar resource in the country.`;
  if (state.sunHours >= US_AVERAGE_SUN_HOURS) return `${lead}, comfortably above the US average.`;
  return `${lead}, below the US average of ${US_AVERAGE_SUN_HOURS}. Your array needs to be a little larger to produce the same power, which is already reflected in the system size above.`;
}

function rateDetail(state: StateProfile): string {
  const cents = (state.rate * 100).toFixed(1);
  const lead = `${state.name} averages ${cents} cents/kWh`;
  if (state.rate >= US_AVERAGE_RATE) {
    return `${lead} - well above the national average. Every kWh you make is a kWh you don't buy at that price.`;
  }
  return `${lead}, which is cheap by national standards. Cheap power is good news generally, but it means each kWh solar saves you is worth less, so payback takes longer.`;
}

function shadeDetail(shade: ShadeLevel): string {
  switch (shade) {
    case 'none': return 'Your roof gets clear sun all day - the ideal case.';
    case 'light': return 'A little shade at the edges of the day costs you very little production.';
    case 'moderate': return 'Moderate shade cuts output noticeably. Panel-level optimizers or microinverters help recover some of it.';
    case 'heavy': return 'Heavy shade is the biggest single limit on your system. Tree trimming or a ground mount may be the real answer.';
  }
}

function directionDetail(direction: RoofDirection): string {
  switch (direction) {
    case 'south': return 'A south-facing roof is the best possible orientation in the northern hemisphere.';
    case 'southeast_southwest': return 'Southeast or southwest roofs produce within a few percent of due south.';
    case 'east_west': return 'East/west roofs produce roughly 15% less than south, and spread output across morning and evening.';
    case 'north': return 'A north-facing slope is the weakest orientation. A designer will look for other roof planes or a ground mount.';
    case 'flat': return 'Flat roofs are fine - panels get tilted on racking to face the sun.';
    case 'not_sure': return 'We will confirm your roof planes from satellite imagery before quoting.';
  }
}

function roofAgeDetail(age: RoofAge): string {
  switch (age) {
    case 'under_10': return 'A roof under 10 years old will comfortably outlive the payback period.';
    case '10_to_20': return 'Your roof has life left, but ask the installer to inspect it as part of the site survey.';
    case 'over_20': return 'A roof over 20 years old usually wants replacing before panels go on it.';
    case 'not_sure': return 'The site survey will include a roof condition check.';
  }
}
