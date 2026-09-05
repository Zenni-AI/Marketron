import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JsonlLeadStore, leadsToCsv } from '../server/store.ts';
import type { StoredLead } from '../shared/types.ts';

let dir: string;
let store: JsonlLeadStore;

const lead = (overrides: Partial<StoredLead> = {}): StoredLead => ({
  id: overrides.id ?? 'lead-1',
  createdAt: overrides.createdAt ?? '2026-03-01T12:00:00.000Z',
  answers: {
    zip: '85001', monthlyBill: 220, propertyType: 'own_home', shade: 'none',
    roofDirection: 'south', roofAge: 'under_10', timeline: 'asap', creditBand: 'excellent',
  },
  contact: {
    firstName: 'Dana', lastName: 'Rivera', email: 'dana@example.com', phone: '6025550142',
    street: '18 Palm Ridge Rd', city: 'Phoenix', bestTimeToCall: 'evening',
    consent: true, consentText: 'consent recorded',
  },
  score: 82,
  tier: 'excellent',
  estimate: null,
  priority: 'hot',
  source: { utm: {} },
  ...overrides,
});

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'marketron-'));
  store = new JsonlLeadStore(join(dir, 'nested', 'leads.jsonl'));
});
afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

describe('JsonlLeadStore', () => {
  it('returns an empty list before any lead is captured', async () => {
    expect(await store.all()).toEqual([]);
  });

  it('creates the directory on first write and reads the lead back', async () => {
    await store.save(lead());
    const all = await store.all();
    expect(all).toHaveLength(1);
    expect(all[0]?.contact.email).toBe('dana@example.com');
  });

  it('lists newest first so the sales desk works the freshest lead', async () => {
    await store.save(lead({ id: 'older', createdAt: '2026-03-01T09:00:00.000Z' }));
    await store.save(lead({ id: 'newer', createdAt: '2026-03-01T18:00:00.000Z' }));
    expect((await store.all()).map((l) => l.id)).toEqual(['newer', 'older']);
  });

  it('skips a truncated trailing line rather than losing every earlier lead', async () => {
    await store.save(lead({ id: 'good' }));
    const { appendFile } = await import('node:fs/promises');
    await appendFile(join(dir, 'nested', 'leads.jsonl'), '{"id":"half-writ', 'utf8');
    const all = await store.all();
    expect(all).toHaveLength(1);
    expect(all[0]?.id).toBe('good');
  });
});

describe('leadsToCsv', () => {
  it('writes a header plus one row per lead', () => {
    const csv = leadsToCsv([lead(), lead({ id: 'lead-2' })]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('email');
    expect(lines[1]).toContain('dana@example.com');
  });

  it('escapes quotes and commas so a note cannot break the columns', () => {
    const csv = leadsToCsv([lead({
      contact: { ...lead().contact, notes: 'Wants a battery, "ASAP"' },
    })]);
    expect(csv).toContain('"Wants a battery, ""ASAP"""');
    expect(csv.split('\n')).toHaveLength(2);
  });

  it('neutralises a spreadsheet formula smuggled in through a free-text field', () => {
    const csv = leadsToCsv([lead({
      contact: { ...lead().contact, notes: '=HYPERLINK("http://evil.example","click")' },
    })]);
    expect(csv).toContain(`"'=HYPERLINK`);
  });
});
