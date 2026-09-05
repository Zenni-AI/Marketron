import { describe, expect, it } from 'vitest';
import { answersSchema, contactSchema, fieldErrors, leadSchema } from '../shared/validation.ts';
import { CONSENT_TEXT_FIXTURE } from './fixtures.ts';

const validContact = {
  firstName: 'Dana',
  lastName: 'Rivera',
  email: 'Dana.Rivera@Example.com',
  phone: '(602) 555-0142',
  street: '18 Palm Ridge Rd',
  city: 'Phoenix',
  bestTimeToCall: 'evening',
  consent: true,
  consentText: CONSENT_TEXT_FIXTURE,
};

describe('contactSchema', () => {
  it('normalises a formatted phone number to 10 digits', () => {
    const parsed = contactSchema.parse(validContact);
    expect(parsed.phone).toBe('6025550142');
  });

  it('strips a leading country code', () => {
    const parsed = contactSchema.parse({ ...validContact, phone: '+1 602 555 0142' });
    expect(parsed.phone).toBe('6025550142');
  });

  it('rejects a phone number a rep could not dial', () => {
    const result = contactSchema.safeParse({ ...validContact, phone: '555-0142' });
    expect(result.success).toBe(false);
  });

  it('lowercases the email so duplicate leads collapse', () => {
    expect(contactSchema.parse(validContact).email).toBe('dana.rivera@example.com');
  });

  it('refuses to accept a lead without express consent', () => {
    const result = contactSchema.safeParse({ ...validContact, consent: false });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).consent).toMatch(/permission/i);
  });

  it('requires the consent wording to be recorded alongside the flag', () => {
    const result = contactSchema.safeParse({ ...validContact, consentText: '' });
    expect(result.success).toBe(false);
  });

  it('reports every bad field at once so the form can highlight them together', () => {
    const result = contactSchema.safeParse({ ...validContact, firstName: '', email: 'nope', phone: '1' });
    expect(result.success).toBe(false);
    const errors = fieldErrors(result.error!);
    expect(Object.keys(errors).sort()).toEqual(['email', 'firstName', 'phone']);
  });
});

describe('answersSchema', () => {
  const answers = {
    zip: '85001', monthlyBill: 220, propertyType: 'own_home', shade: 'none',
    roofDirection: 'south', roofAge: 'under_10', timeline: 'asap', creditBand: 'excellent',
  };

  it('accepts a complete set of answers', () => {
    expect(answersSchema.safeParse(answers).success).toBe(true);
  });

  it('rejects a ZIP that maps to no US state', () => {
    const result = answersSchema.safeParse({ ...answers, zip: '00100' });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).zip).toMatch(/could not find/i);
  });

  it('rejects an out-of-range bill', () => {
    expect(answersSchema.safeParse({ ...answers, monthlyBill: 5 }).success).toBe(false);
    expect(answersSchema.safeParse({ ...answers, monthlyBill: 99999 }).success).toBe(false);
  });

  it('rejects an answer outside the allowed choices', () => {
    expect(answersSchema.safeParse({ ...answers, shade: 'a bit' }).success).toBe(false);
  });
});

describe('leadSchema', () => {
  const answers = {
    zip: '85001', monthlyBill: 220, propertyType: 'own_home', shade: 'none',
    roofDirection: 'south', roofAge: 'under_10', timeline: 'asap', creditBand: 'excellent',
  };

  it('defaults utm to an empty object when the visitor arrived directly', () => {
    const parsed = leadSchema.parse({ answers, contact: validContact });
    expect(parsed.utm).toEqual({});
  });

  it('keeps campaign attribution when present', () => {
    const parsed = leadSchema.parse({
      answers, contact: validContact,
      utm: { utm_source: 'facebook', utm_campaign: 'solar-q3' },
      referrer: 'https://www.facebook.com/',
    });
    expect(parsed.utm.utm_source).toBe('facebook');
    expect(parsed.referrer).toBe('https://www.facebook.com/');
  });

  it('parses a filled honeypot rather than rejecting it', () => {
    // The route, not the schema, decides what happens to a tripped honeypot:
    // it returns a normal 201 and discards the submission. Rejecting here would
    // hand a bot a 400 naming the field, which is how they learn to skip it.
    const result = leadSchema.safeParse({ answers, contact: validContact, website: 'http://spam.example' });
    expect(result.success).toBe(true);
    expect(result.data?.website).toBe('http://spam.example');
  });

  it('leaves the honeypot undefined for a real submission', () => {
    expect(leadSchema.parse({ answers, contact: validContact }).website).toBeUndefined();
  });
});
