import type {
  CreditBand, PropertyType, RoofAge, RoofDirection, ShadeLevel, Timeline,
} from '../../shared/types.ts';

export interface Choice<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon: string;
}

/**
 * Question order is deliberate. ZIP and bill come first because they are the
 * lowest-friction inputs and they are what makes the estimate feel personal.
 * Ownership is asked third: it is the only hard disqualifier, so we want it
 * early enough to stop wasting a renter's time but late enough that the
 * homeowner is already invested in finishing.
 */
export const STEP_IDS = [
  'zip', 'bill', 'property', 'shade', 'direction', 'roofAge', 'utility', 'timeline', 'credit',
] as const;
export type StepId = (typeof STEP_IDS)[number];

export const PROPERTY_CHOICES: Choice<PropertyType>[] = [
  { value: 'own_home', label: 'I own my home', icon: '🏠' },
  { value: 'rent', label: 'I rent', hint: 'We will show you other options', icon: '🔑' },
  { value: 'business', label: 'I own a business property', icon: '🏢' },
  { value: 'other', label: 'Something else', hint: 'Mobile home, co-op, land', icon: '📍' },
];

export const SHADE_CHOICES: Choice<ShadeLevel>[] = [
  { value: 'none', label: 'No shade', hint: 'Full sun most of the day', icon: '☀️' },
  { value: 'light', label: 'A little shade', hint: 'Shaded early or late only', icon: '🌤️' },
  { value: 'moderate', label: 'Some shade', hint: 'Trees or a neighbour clip the roof', icon: '⛅' },
  { value: 'heavy', label: 'Heavily shaded', hint: 'Shaded much of the day', icon: '🌳' },
];

export const DIRECTION_CHOICES: Choice<RoofDirection>[] = [
  { value: 'south', label: 'South', hint: 'Best case', icon: '⬇️' },
  { value: 'southeast_southwest', label: 'Southeast or southwest', icon: '↘️' },
  { value: 'east_west', label: 'East or west', icon: '↔️' },
  { value: 'north', label: 'North', icon: '⬆️' },
  { value: 'flat', label: 'My roof is flat', icon: '▭' },
  { value: 'not_sure', label: "I'm not sure", hint: "We'll check satellite imagery", icon: '❔' },
];

export const ROOF_AGE_CHOICES: Choice<RoofAge>[] = [
  { value: 'under_10', label: 'Less than 10 years', icon: '✨' },
  { value: '10_to_20', label: '10 to 20 years', icon: '🏘️' },
  { value: 'over_20', label: 'More than 20 years', hint: 'May need replacing first', icon: '🛠️' },
  { value: 'not_sure', label: "I'm not sure", icon: '❔' },
];

export const TIMELINE_CHOICES: Choice<Timeline>[] = [
  { value: 'asap', label: 'As soon as possible', icon: '⚡' },
  { value: '1_to_3_months', label: 'In the next 1-3 months', icon: '📅' },
  { value: '3_to_6_months', label: 'In 3-6 months', icon: '🗓️' },
  { value: 'researching', label: 'Just researching for now', icon: '🔍' },
];

export const CREDIT_CHOICES: Choice<CreditBand>[] = [
  { value: 'excellent', label: 'Excellent (720+)', hint: 'Best financing rates', icon: '🌟' },
  { value: 'good', label: 'Good (660-719)', icon: '👍' },
  { value: 'fair', label: 'Fair (600-659)', icon: '🙂' },
  { value: 'poor', label: 'Below 600', hint: 'Lease and PPA options exist', icon: '📉' },
  { value: 'not_sure', label: "I'd rather not say", icon: '🤐' },
];

export const BILL_PRESETS = [80, 120, 175, 250, 350] as const;

/**
 * The largest utilities per state, offered as suggestions so most homeowners
 * pick rather than type. The field stays free-text for co-ops and munis.
 */
export const UTILITIES_BY_STATE: Record<string, string[]> = {
  AZ: ['APS', 'Salt River Project', 'Tucson Electric Power'],
  CA: ['PG&E', 'Southern California Edison', 'SDG&E', 'LADWP', 'SMUD'],
  CO: ['Xcel Energy', 'Black Hills Energy', 'Colorado Springs Utilities'],
  CT: ['Eversource', 'United Illuminating'],
  FL: ['Florida Power & Light', 'Duke Energy Florida', 'TECO', 'JEA'],
  GA: ['Georgia Power', 'Jackson EMC', 'Cobb EMC'],
  IL: ['ComEd', 'Ameren Illinois'],
  MA: ['Eversource', 'National Grid', 'Unitil'],
  MD: ['BGE', 'Pepco', 'Delmarva Power', 'Potomac Edison'],
  MI: ['DTE Energy', 'Consumers Energy'],
  MN: ['Xcel Energy', 'Minnesota Power', 'Great River Energy'],
  NC: ['Duke Energy', 'Dominion Energy', 'Piedmont EMC'],
  NJ: ['PSE&G', 'JCP&L', 'Atlantic City Electric'],
  NM: ['PNM', 'El Paso Electric', 'Xcel Energy'],
  NV: ['NV Energy'],
  NY: ['Con Edison', 'National Grid', 'NYSEG', 'PSEG Long Island', 'Central Hudson'],
  OH: ['AEP Ohio', 'FirstEnergy', 'Duke Energy Ohio', 'AES Ohio'],
  OR: ['Portland General Electric', 'Pacific Power', 'Idaho Power'],
  PA: ['PECO', 'PPL Electric', 'Duquesne Light', 'FirstEnergy'],
  SC: ['Dominion Energy', 'Duke Energy Progress', 'Santee Cooper'],
  TX: ['Oncor', 'CenterPoint Energy', 'AEP Texas', 'Austin Energy', 'CPS Energy'],
  UT: ['Rocky Mountain Power'],
  VA: ['Dominion Energy', 'Appalachian Power', 'NOVEC'],
  WA: ['Puget Sound Energy', 'Seattle City Light', 'Avista', 'Snohomish PUD'],
  WI: ['We Energies', 'Alliant Energy', 'Madison Gas & Electric'],
};
