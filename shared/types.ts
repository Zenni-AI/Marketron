/** Every answer the qualifier collects, plus the derived result shapes. */

export const PROPERTY_TYPES = ['own_home', 'rent', 'business', 'other'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const SHADE_LEVELS = ['none', 'light', 'moderate', 'heavy'] as const;
export type ShadeLevel = (typeof SHADE_LEVELS)[number];

export const ROOF_DIRECTIONS = ['south', 'southeast_southwest', 'east_west', 'north', 'flat', 'not_sure'] as const;
export type RoofDirection = (typeof ROOF_DIRECTIONS)[number];

export const ROOF_AGES = ['under_10', '10_to_20', 'over_20', 'not_sure'] as const;
export type RoofAge = (typeof ROOF_AGES)[number];

export const TIMELINES = ['asap', '1_to_3_months', '3_to_6_months', 'researching'] as const;
export type Timeline = (typeof TIMELINES)[number];

export const CREDIT_BANDS = ['excellent', 'good', 'fair', 'poor', 'not_sure'] as const;
export type CreditBand = (typeof CREDIT_BANDS)[number];

export interface QualifierAnswers {
  zip: string;
  monthlyBill: number;
  propertyType: PropertyType;
  shade: ShadeLevel;
  roofDirection: RoofDirection;
  roofAge: RoofAge;
  utility?: string;
  timeline: Timeline;
  creditBand: CreditBand;
  /** Set when the homeowner corrects the state we detected from their ZIP. */
  stateOverride?: string;
}

export type FitTier = 'excellent' | 'strong' | 'moderate' | 'limited' | 'not_yet';

export interface ScoreFactor {
  key: string;
  label: string;
  /** 0..1 - how favourable this factor is. */
  value: number;
  /** Points this factor contributed out of 100. */
  points: number;
  maxPoints: number;
  detail: string;
}

export interface SavingsEstimate {
  systemSizeKw: number;
  panelCount: number;
  annualProductionKwh: number;
  annualUsageKwh: number;
  offsetPercent: number;
  grossCost: number;
  federalCredit: number;
  netCost: number;
  firstYearSavings: number;
  monthlySavings: number;
  lifetimeSavings: number;
  paybackYears: number | null;
  co2PoundsPerYear: number;
  treesEquivalent: number;
}

export interface FitResult {
  score: number;
  tier: FitTier;
  headline: string;
  summary: string;
  qualified: boolean;
  factors: ScoreFactor[];
  strengths: string[];
  watchouts: string[];
  state: { code: string; name: string; policyNote: string };
  estimate: SavingsEstimate | null;
  /** Alternative path offered when the property itself rules out rooftop solar. */
  alternative?: { headline: string; body: string };
}

export interface LeadContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  bestTimeToCall: string;
  notes?: string;
  /** TCPA express written consent - required before we can dial the lead. */
  consent: boolean;
  consentText: string;
}

export interface StoredLead {
  id: string;
  createdAt: string;
  answers: QualifierAnswers;
  contact: LeadContact;
  score: number;
  tier: FitTier;
  estimate: SavingsEstimate | null;
  /** Sales routing bucket derived from fit, bill size, and timeline. */
  priority: 'hot' | 'warm' | 'nurture';
  source: { referrer?: string; utm: Record<string, string>; userAgent?: string; ip?: string };
}
