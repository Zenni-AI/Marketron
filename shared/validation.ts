import { z } from 'zod';
import {
  CREDIT_BANDS, PROPERTY_TYPES, ROOF_AGES, ROOF_DIRECTIONS, SHADE_LEVELS, TIMELINES,
} from './types.ts';
import { stateFromZip } from './geo.ts';

export const zipSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, 'Enter a 5-digit US ZIP code')
  .refine((zip) => stateFromZip(zip) !== null, 'We could not find that ZIP code. Double-check the digits?');

export const answersSchema = z.object({
  zip: zipSchema,
  monthlyBill: z.number().int().min(20, 'Enter your average bill').max(2000),
  propertyType: z.enum(PROPERTY_TYPES),
  shade: z.enum(SHADE_LEVELS),
  roofDirection: z.enum(ROOF_DIRECTIONS),
  roofAge: z.enum(ROOF_AGES),
  utility: z.string().trim().max(120).optional(),
  timeline: z.enum(TIMELINES),
  creditBand: z.enum(CREDIT_BANDS),
  stateOverride: z.string().trim().length(2).optional(),
});

/**
 * Phone validation is deliberately North-America shaped: this funnel books
 * callbacks, and a number a rep cannot dial is a wasted lead.
 */
const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[^\d]/g, ''))
  .refine((digits) => digits.length === 10 || (digits.length === 11 && digits.startsWith('1')), {
    message: 'Enter a 10-digit US phone number',
  })
  .transform((digits) => (digits.length === 11 ? digits.slice(1) : digits));

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(60),
  lastName: z.string().trim().min(1, 'Last name is required').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(160),
  phone: phoneSchema,
  street: z.string().trim().min(3, 'Street address is required').max(160),
  city: z.string().trim().min(2, 'City is required').max(80),
  bestTimeToCall: z.string().trim().max(40).default('anytime'),
  notes: z.string().trim().max(1000).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'We need your permission before a specialist can call you' }),
  }),
  consentText: z.string().trim().min(10).max(2000),
});

export const leadSchema = z.object({
  answers: answersSchema,
  contact: contactSchema,
  utm: z.record(z.string().max(200)).default({}),
  referrer: z.string().max(500).optional(),
  /**
   * Honeypot: a real person never fills this in, but the schema must ACCEPT it
   * so the route can decide what to do. Rejecting here would hand a bot a 400
   * naming the field, which is exactly how they learn to skip it.
   */
  website: z.string().max(500).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Flatten a ZodError into `{ fieldPath: message }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!(path in out)) out[path] = issue.message;
  }
  return out;
}
