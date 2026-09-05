import { describe, expect, it } from 'vitest';
import { estimateSavings, evaluate, priorityFor } from '../shared/solar-engine.ts';
import { STATES, profileFromZip, stateFromZip } from '../shared/geo.ts';
import type { QualifierAnswers } from '../shared/types.ts';

const baseAnswers: QualifierAnswers = {
  zip: '85001',            // Phoenix, AZ - high sun
  monthlyBill: 220,
  propertyType: 'own_home',
  shade: 'none',
  roofDirection: 'south',
  roofAge: 'under_10',
  timeline: 'asap',
  creditBand: 'excellent',
};

const answers = (overrides: Partial<QualifierAnswers> = {}): QualifierAnswers => ({ ...baseAnswers, ...overrides });

describe('stateFromZip', () => {
  it('resolves representative ZIPs across the country', () => {
    expect(stateFromZip('90210')).toBe('CA');
    expect(stateFromZip('10001')).toBe('NY');
    expect(stateFromZip('33101')).toBe('FL');
    expect(stateFromZip('78701')).toBe('TX');
    expect(stateFromZip('02108')).toBe('MA');
    expect(stateFromZip('98101')).toBe('WA');
    expect(stateFromZip('99501')).toBe('AK');
    expect(stateFromZip('96801')).toBe('HI');
  });

  it('handles prefixes that are carved out of a neighbouring range', () => {
    expect(stateFromZip('73301')).toBe('TX'); // Austin, inside the OK block
    expect(stateFromZip('88510')).toBe('TX'); // El Paso, inside the NM block
    expect(stateFromZip('20001')).toBe('DC');
    expect(stateFromZip('20101')).toBe('VA'); // 201 is Dulles, not DC
  });

  it('rejects anything that is not a serviceable 5-digit US ZIP', () => {
    expect(stateFromZip('1234')).toBeNull();
    expect(stateFromZip('abcde')).toBeNull();
    expect(stateFromZip('')).toBeNull();
    expect(stateFromZip('00100')).toBeNull(); // below the first assigned prefix
    expect(stateFromZip('42900')).toBeNull(); // 429 sits in the gap between KY and OH
  });

  it('returns a full profile for a valid ZIP', () => {
    const profile = profileFromZip('80202');
    expect(profile?.code).toBe('CO');
    expect(profile?.sunHours).toBeGreaterThan(0);
    expect(profile?.rate).toBeGreaterThan(0);
  });
});

describe('state dataset', () => {
  it('keeps every profile inside a sane range', () => {
    for (const [code, profile] of Object.entries(STATES)) {
      expect(profile.sunHours, code).toBeGreaterThanOrEqual(2.5);
      expect(profile.sunHours, code).toBeLessThanOrEqual(7);
      expect(profile.rate, code).toBeGreaterThan(0.05);
      expect(profile.rate, code).toBeLessThan(0.6);
      expect(profile.policy, code).toBeGreaterThanOrEqual(0);
      expect(profile.policy, code).toBeLessThanOrEqual(1);
      expect(profile.costPerWatt, code).toBeGreaterThan(1);
    }
  });
});

describe('evaluate', () => {
  it('scores a sunny, unshaded, high-bill home as a strong fit', () => {
    const result = evaluate(answers());
    expect(result.score).toBeGreaterThanOrEqual(62);
    expect(result.tier).toBe('strong');
    expect(result.qualified).toBe(true);
    expect(result.estimate).not.toBeNull();
  });

  it('reserves the top tier for homes with both sun and expensive power', () => {
    // Southern California: good sun AND 32 cents/kWh. Phoenix has better sun
    // but far cheaper power, which is genuinely the weaker solar investment -
    // the score is meant to reflect that rather than reward sunshine alone.
    const california = evaluate(answers({ zip: '90210' }));
    expect(california.tier).toBe('excellent');
    expect(california.score).toBeGreaterThan(evaluate(answers({ zip: '85001' })).score);
  });

  it('drops the score when the roof is heavily shaded', () => {
    const clear = evaluate(answers()).score;
    const shaded = evaluate(answers({ shade: 'heavy' })).score;
    expect(shaded).toBeLessThan(clear);
    // Shade is worth 19 points, so a clear -> heavy swing must move the needle.
    expect(clear - shaded).toBeGreaterThan(14);
  });

  it('scores a small bill in a cheap-power state below a big bill in an expensive one', () => {
    const cheap = evaluate(answers({ zip: '58501', monthlyBill: 60 })).score;  // ND
    const pricey = evaluate(answers({ zip: '02108', monthlyBill: 320 })).score; // MA
    expect(pricey).toBeGreaterThan(cheap);
  });

  it('never produces a score outside 0-100', () => {
    const best = evaluate(answers({ zip: '89101', monthlyBill: 500, shade: 'none', roofDirection: 'south', roofAge: 'under_10' }));
    const worst = evaluate(answers({ zip: '58501', monthlyBill: 20, shade: 'heavy', roofDirection: 'north', roofAge: 'over_20' }));
    expect(best.score).toBeLessThanOrEqual(100);
    expect(worst.score).toBeGreaterThanOrEqual(0);
  });

  it('routes renters to community solar instead of scoring their roof', () => {
    const result = evaluate(answers({ propertyType: 'rent' }));
    expect(result.qualified).toBe(false);
    expect(result.tier).toBe('not_yet');
    expect(result.estimate).toBeNull();
    expect(result.alternative?.headline).toMatch(/community solar/i);
  });

  it('flags an ageing roof as a watchout', () => {
    const result = evaluate(answers({ roofAge: 'over_20' }));
    expect(result.watchouts.join(' ')).toMatch(/re-roofing|replacing/i);
  });

  it('throws on a ZIP it cannot place', () => {
    expect(() => evaluate(answers({ zip: '00000' }))).toThrow(/could not resolve/i);
  });

  it('honours an explicit state override over the ZIP lookup', () => {
    const result = evaluate(answers({ stateOverride: 'HI' }));
    expect(result.state.code).toBe('HI');
  });
});

describe('estimateSavings', () => {
  const az = STATES.AZ!;

  it('sizes a system that roughly covers the target offset', () => {
    const estimate = estimateSavings(answers(), az);
    expect(estimate.systemSizeKw).toBeGreaterThan(4);
    expect(estimate.systemSizeKw).toBeLessThan(20);
    expect(estimate.offsetPercent).toBeGreaterThan(85);
    expect(estimate.offsetPercent).toBeLessThanOrEqual(100);
    expect(estimate.panelCount).toBe(Math.ceil((estimate.systemSizeKw * 1000) / 400));
  });

  it('specifies a bigger array for a shaded roof covering the same usage', () => {
    const clear = estimateSavings(answers(), az);
    const shaded = estimateSavings(answers({ shade: 'heavy' }), az);
    expect(shaded.systemSizeKw).toBeGreaterThan(clear.systemSizeKw);
  });

  it('never promises more savings than the homeowner currently spends', () => {
    const bill = 90;
    const estimate = estimateSavings(answers({ monthlyBill: bill }), az);
    expect(estimate.firstYearSavings).toBeLessThanOrEqual(bill * 12);
  });

  it('derives payback from net cost and first-year savings', () => {
    const estimate = estimateSavings(answers(), az);
    expect(estimate.paybackYears).toBeCloseTo(estimate.netCost / estimate.firstYearSavings, 1);
    expect(estimate.paybackYears!).toBeGreaterThan(0);
  });

  it('does not assume an expired federal credit', () => {
    // Section 25D ended for purchases after 2025-12-31; quoting it would
    // inflate every estimate the sales team then has to walk back.
    const estimate = estimateSavings(answers(), az);
    expect(estimate.federalCredit).toBe(0);
    expect(estimate.netCost).toBe(estimate.grossCost);
  });

  it('reports an environmental equivalent proportional to production', () => {
    const estimate = estimateSavings(answers(), az);
    expect(estimate.co2PoundsPerYear).toBeGreaterThan(0);
    expect(estimate.treesEquivalent).toBeGreaterThan(0);
  });
});

describe('priorityFor', () => {
  it('marks a high-scoring, ready-to-buy homeowner as hot', () => {
    expect(priorityFor(85, answers())).toBe('hot');
  });

  it('demotes a researcher no matter how good the roof is', () => {
    expect(priorityFor(90, answers({ timeline: 'researching' }))).toBe('nurture');
  });

  it('keeps a good fit with a mid timeline as warm', () => {
    expect(priorityFor(70, answers({ timeline: '3_to_6_months' }))).toBe('warm');
  });

  it('never marks a renter hot', () => {
    expect(priorityFor(95, answers({ propertyType: 'rent' }))).toBe('nurture');
  });

  it('demotes a hot-looking lead that cannot finance the system', () => {
    expect(priorityFor(85, answers({ creditBand: 'poor' }))).not.toBe('hot');
  });
});

describe('factor copy', () => {
  it('explains why a low-sun state is a drawback rather than stating a bare figure', () => {
    const result = evaluate(answers({ zip: '02108' })); // MA - 4.3 sun hours
    const sun = result.factors.find((f) => f.key === 'sun');
    expect(sun?.detail).toMatch(/below the US average/i);
    // It lands in the watchouts list, so it has to read sensibly under a warning.
    expect(result.watchouts).toContain(sun!.detail);
  });

  it('explains why cheap power lengthens payback', () => {
    const result = evaluate(answers({ zip: '58501' })); // ND - 10.8 cents
    const rate = result.factors.find((f) => f.key === 'rate');
    expect(rate?.detail).toMatch(/payback takes longer/i);
  });

  it('frames an expensive, sunny state as a strength', () => {
    const result = evaluate(answers({ zip: '90210' }));
    const rate = result.factors.find((f) => f.key === 'rate');
    expect(rate?.detail).toMatch(/above the national average/i);
    expect(result.strengths).toContain(rate!.detail);
  });
});
