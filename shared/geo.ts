/**
 * Location data behind the solar fit score.
 *
 * `sunHours`  - average daily peak sun hours for a fixed, roof-mounted array
 *               (annual mean, NREL-style figures rounded to one decimal).
 * `rate`      - average residential retail electricity rate in $/kWh. This is
 *               the single biggest driver of solar savings: the value of a
 *               kWh you *don't* buy is whatever your utility charges for it.
 * `policy`    - 0..1 score for how well the state's net metering / net billing
 *               rules pay for exported power, plus notable state incentives.
 * `costPerWatt` - typical installed residential price before incentives.
 *
 * These are planning-grade state averages, good enough to tell a homeowner
 * whether solar is worth a conversation. Before quoting a contract price,
 * replace this with a real irradiance lookup (PVWatts) and the homeowner's
 * actual utility tariff (Genability / utility API).
 */
export interface StateProfile {
  name: string;
  sunHours: number;
  rate: number;
  policy: number;
  policyNote: string;
  costPerWatt: number;
}

export const STATES: Record<string, StateProfile> = {
  AL: { name: 'Alabama', sunHours: 4.6, rate: 0.161, policy: 0.25, policyNote: 'No statewide net metering; Alabama Power charges a capacity fee on solar homes.', costPerWatt: 2.95 },
  AK: { name: 'Alaska', sunHours: 3.0, rate: 0.249, policy: 0.55, policyNote: 'Net metering available to most utilities, capped at 1.5% of retail sales.', costPerWatt: 3.40 },
  AZ: { name: 'Arizona', sunHours: 6.5, rate: 0.155, policy: 0.55, policyNote: 'Net billing at an export rate below retail; excellent sun offsets it.', costPerWatt: 2.75 },
  AR: { name: 'Arkansas', sunHours: 4.7, rate: 0.132, policy: 0.60, policyNote: 'Net metering at retail rate for systems installed under current rules.', costPerWatt: 2.85 },
  CA: { name: 'California', sunHours: 5.7, rate: 0.323, policy: 0.55, policyNote: 'NEM 3.0 pays low export rates - pairing with a battery is usually required to hit strong savings.', costPerWatt: 3.05 },
  CO: { name: 'Colorado', sunHours: 5.5, rate: 0.157, policy: 0.85, policyNote: 'Full retail net metering plus utility rebates in many territories.', costPerWatt: 2.95 },
  CT: { name: 'Connecticut', sunHours: 4.2, rate: 0.323, policy: 0.80, policyNote: 'Residential Renewable Energy Solutions program buys production at a fixed 20-year rate.', costPerWatt: 3.15 },
  DE: { name: 'Delaware', sunHours: 4.4, rate: 0.175, policy: 0.80, policyNote: 'Full retail net metering plus SREC sales.', costPerWatt: 3.00 },
  DC: { name: 'District of Columbia', sunHours: 4.4, rate: 0.180, policy: 1.00, policyNote: 'Full retail net metering and the most valuable SREC market in the country.', costPerWatt: 3.20 },
  FL: { name: 'Florida', sunHours: 5.3, rate: 0.156, policy: 0.90, policyNote: 'Full retail net metering and no state sales or property tax on solar.', costPerWatt: 2.65 },
  GA: { name: 'Georgia', sunHours: 4.9, rate: 0.148, policy: 0.45, policyNote: 'Monthly netting with limited export credit; self-consumption drives the savings.', costPerWatt: 2.85 },
  HI: { name: 'Hawaii', sunHours: 5.9, rate: 0.428, policy: 0.70, policyNote: 'No standard net metering, but the highest power prices in the US make self-consumption very valuable.', costPerWatt: 3.40 },
  ID: { name: 'Idaho', sunHours: 4.9, rate: 0.118, policy: 0.55, policyNote: 'Utility-specific net billing programs.', costPerWatt: 2.85 },
  IL: { name: 'Illinois', sunHours: 4.4, rate: 0.175, policy: 0.90, policyNote: 'Full retail net metering plus Illinois Shines REC payments.', costPerWatt: 3.00 },
  IN: { name: 'Indiana', sunHours: 4.3, rate: 0.154, policy: 0.35, policyNote: 'Net metering closed to new customers; excess exports credited at wholesale plus 25%.', costPerWatt: 2.90 },
  IA: { name: 'Iowa', sunHours: 4.5, rate: 0.137, policy: 0.70, policyNote: 'Net billing with retail-rate credit for most investor-owned utilities.', costPerWatt: 2.95 },
  KS: { name: 'Kansas', sunHours: 5.2, rate: 0.148, policy: 0.50, policyNote: 'Net metering available but credits expire annually.', costPerWatt: 2.90 },
  KY: { name: 'Kentucky', sunHours: 4.3, rate: 0.134, policy: 0.40, policyNote: 'Export credits set below retail by utility tariff.', costPerWatt: 2.90 },
  LA: { name: 'Louisiana', sunHours: 4.9, rate: 0.124, policy: 0.45, policyNote: 'Net billing at avoided cost for new systems.', costPerWatt: 2.85 },
  ME: { name: 'Maine', sunHours: 4.2, rate: 0.258, policy: 0.90, policyNote: 'Kilowatt-hour credit net energy billing at full retail value.', costPerWatt: 3.05 },
  MD: { name: 'Maryland', sunHours: 4.4, rate: 0.190, policy: 0.95, policyNote: 'Full retail net metering, SREC income, and a state grant per installation.', costPerWatt: 3.05 },
  MA: { name: 'Massachusetts', sunHours: 4.3, rate: 0.318, policy: 0.95, policyNote: 'Net metering plus SMART production incentives and a state income tax credit.', costPerWatt: 3.25 },
  MI: { name: 'Michigan', sunHours: 4.1, rate: 0.199, policy: 0.50, policyNote: 'Distributed generation program credits exports at the power supply rate only.', costPerWatt: 3.05 },
  MN: { name: 'Minnesota', sunHours: 4.4, rate: 0.155, policy: 0.85, policyNote: 'Full retail net metering plus Solar*Rewards rebates.', costPerWatt: 3.00 },
  MS: { name: 'Mississippi', sunHours: 4.8, rate: 0.137, policy: 0.50, policyNote: 'Net billing with an added low-income adder.', costPerWatt: 2.85 },
  MO: { name: 'Missouri', sunHours: 4.7, rate: 0.124, policy: 0.60, policyNote: 'Retail-rate net metering plus utility rebates in some territories.', costPerWatt: 2.85 },
  MT: { name: 'Montana', sunHours: 4.6, rate: 0.128, policy: 0.65, policyNote: 'Full retail net metering for systems up to 50 kW.', costPerWatt: 3.00 },
  NE: { name: 'Nebraska', sunHours: 5.0, rate: 0.116, policy: 0.55, policyNote: 'Statewide net metering up to 25 kW at the utility energy rate.', costPerWatt: 2.90 },
  NV: { name: 'Nevada', sunHours: 6.3, rate: 0.166, policy: 0.65, policyNote: 'Exports credited at 75% of retail; strong sun keeps returns high.', costPerWatt: 2.75 },
  NH: { name: 'New Hampshire', sunHours: 4.2, rate: 0.253, policy: 0.75, policyNote: 'Net metering plus a state rebate per watt installed.', costPerWatt: 3.10 },
  NJ: { name: 'New Jersey', sunHours: 4.4, rate: 0.209, policy: 1.00, policyNote: 'Full retail net metering, SuSI production incentives, and no sales tax on solar.', costPerWatt: 3.00 },
  NM: { name: 'New Mexico', sunHours: 6.4, rate: 0.150, policy: 0.85, policyNote: 'Retail net metering plus a 10% state income tax credit.', costPerWatt: 2.85 },
  NY: { name: 'New York', sunHours: 4.1, rate: 0.254, policy: 0.95, policyNote: 'Value-stack net metering, NY-Sun rebates, and a 25% state tax credit capped at $5,000.', costPerWatt: 3.15 },
  NC: { name: 'North Carolina', sunHours: 4.8, rate: 0.137, policy: 0.60, policyNote: 'Time-of-use net billing with a Duke Energy residential rebate.', costPerWatt: 2.80 },
  ND: { name: 'North Dakota', sunHours: 4.6, rate: 0.108, policy: 0.40, policyNote: 'Net metering at avoided cost; low power prices lengthen payback.', costPerWatt: 3.00 },
  OH: { name: 'Ohio', sunHours: 4.2, rate: 0.166, policy: 0.65, policyNote: 'Net metering at the generation rate plus SREC sales.', costPerWatt: 2.90 },
  OK: { name: 'Oklahoma', sunHours: 5.2, rate: 0.119, policy: 0.40, policyNote: 'No mandated retail net metering; sizing to self-consumption matters.', costPerWatt: 2.85 },
  OR: { name: 'Oregon', sunHours: 4.1, rate: 0.140, policy: 0.75, policyNote: 'Full retail net metering plus Solar + Storage rebates.', costPerWatt: 3.05 },
  PA: { name: 'Pennsylvania', sunHours: 4.2, rate: 0.190, policy: 0.85, policyNote: 'Full retail net metering plus an active SREC market.', costPerWatt: 2.95 },
  RI: { name: 'Rhode Island', sunHours: 4.3, rate: 0.291, policy: 0.90, policyNote: 'Net metering plus Renewable Energy Growth performance payments.', costPerWatt: 3.15 },
  SC: { name: 'South Carolina', sunHours: 4.9, rate: 0.149, policy: 0.70, policyNote: 'Solar Choice net billing and a 25% state tax credit.', costPerWatt: 2.85 },
  SD: { name: 'South Dakota', sunHours: 4.8, rate: 0.123, policy: 0.35, policyNote: 'No statewide net metering mandate.', costPerWatt: 3.00 },
  TN: { name: 'Tennessee', sunHours: 4.5, rate: 0.130, policy: 0.35, policyNote: 'TVA territory buys exports at a low set rate.', costPerWatt: 2.85 },
  TX: { name: 'Texas', sunHours: 5.3, rate: 0.151, policy: 0.60, policyNote: 'No statewide rule, but many retail providers sell solar buyback plans.', costPerWatt: 2.70 },
  UT: { name: 'Utah', sunHours: 5.6, rate: 0.119, policy: 0.50, policyNote: 'Export credit well below retail; self-consumption drives returns.', costPerWatt: 2.80 },
  VT: { name: 'Vermont', sunHours: 4.1, rate: 0.225, policy: 0.90, policyNote: 'Net metering with a renewable energy credit adder.', costPerWatt: 3.15 },
  VA: { name: 'Virginia', sunHours: 4.5, rate: 0.150, policy: 0.75, policyNote: 'Full retail net metering plus a growing SREC market.', costPerWatt: 2.90 },
  WA: { name: 'Washington', sunHours: 3.8, rate: 0.118, policy: 0.60, policyNote: 'Full retail net metering, but cheap hydro power lengthens payback.', costPerWatt: 3.00 },
  WV: { name: 'West Virginia', sunHours: 4.1, rate: 0.157, policy: 0.60, policyNote: 'Retail-rate net metering available statewide.', costPerWatt: 2.90 },
  WI: { name: 'Wisconsin', sunHours: 4.3, rate: 0.175, policy: 0.65, policyNote: 'Utility-specific net metering plus Focus on Energy rebates.', costPerWatt: 3.00 },
  WY: { name: 'Wyoming', sunHours: 5.4, rate: 0.116, policy: 0.45, policyNote: 'Net metering at avoided cost; low power prices lengthen payback.', costPerWatt: 3.00 },
  PR: { name: 'Puerto Rico', sunHours: 5.4, rate: 0.230, policy: 0.80, policyNote: 'Net metering plus strong demand for battery backup during outages.', costPerWatt: 3.10 },
};

export type StateCode = keyof typeof STATES;

/**
 * 3-digit ZIP prefix ranges mapped to a state. Ordered ranges, inclusive on
 * both ends. This resolves the overwhelming majority of residential ZIPs; a
 * handful of prefixes straddle a state line, so the funnel always shows the
 * detected state back to the homeowner and lets them correct it.
 */
const ZIP_PREFIX_RANGES: ReadonlyArray<readonly [number, number, string]> = [
  [5, 5, 'NY'], [6, 9, 'PR'], [10, 27, 'MA'], [28, 29, 'RI'], [30, 38, 'NH'],
  [39, 49, 'ME'], [50, 59, 'VT'], [60, 69, 'CT'], [70, 89, 'NJ'],
  [100, 149, 'NY'], [150, 196, 'PA'], [197, 199, 'DE'], [200, 200, 'DC'],
  [201, 201, 'VA'], [202, 205, 'DC'], [206, 219, 'MD'], [220, 246, 'VA'],
  [247, 268, 'WV'], [270, 289, 'NC'], [290, 299, 'SC'], [300, 319, 'GA'],
  [320, 349, 'FL'], [350, 369, 'AL'], [370, 385, 'TN'], [386, 397, 'MS'],
  [398, 399, 'GA'], [400, 427, 'KY'], [430, 459, 'OH'], [460, 479, 'IN'],
  [480, 499, 'MI'], [500, 528, 'IA'], [530, 549, 'WI'], [550, 567, 'MN'],
  [570, 577, 'SD'], [580, 588, 'ND'], [590, 599, 'MT'], [600, 629, 'IL'],
  [630, 658, 'MO'], [660, 679, 'KS'], [680, 693, 'NE'], [700, 714, 'LA'],
  [716, 729, 'AR'], [730, 731, 'OK'], [733, 733, 'TX'], [734, 749, 'OK'],
  [750, 799, 'TX'], [800, 816, 'CO'], [820, 831, 'WY'], [832, 838, 'ID'],
  [840, 847, 'UT'], [850, 865, 'AZ'], [870, 884, 'NM'], [885, 885, 'TX'],
  [889, 898, 'NV'], [900, 961, 'CA'], [967, 968, 'HI'], [970, 979, 'OR'],
  [980, 994, 'WA'], [995, 999, 'AK'],
];

/** Resolve a 5-digit ZIP to a state code, or null if it isn't a serviceable US ZIP. */
export function stateFromZip(zip: string): string | null {
  const trimmed = zip.trim();
  if (!/^\d{5}$/.test(trimmed)) return null;
  const prefix = Number(trimmed.slice(0, 3));
  for (const [start, end, state] of ZIP_PREFIX_RANGES) {
    if (prefix >= start && prefix <= end) return state;
  }
  return null;
}

export function profileFromZip(zip: string): (StateProfile & { code: string }) | null {
  const code = stateFromZip(zip);
  if (!code) return null;
  const profile = STATES[code];
  return profile ? { ...profile, code } : null;
}
