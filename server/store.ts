import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { stateFromZip } from '../shared/geo.ts';
import type { StoredLead } from '../shared/types.ts';

/**
 * Leads are appended as JSON Lines. Append-only means a crash mid-write can
 * never corrupt earlier leads, and the file stays greppable and importable.
 *
 * This is the right storage for a single-box deployment handling tens of leads
 * a day. Swap `LeadStore` for a Postgres/Supabase implementation when you need
 * concurrent writers or a real CRM sync - the interface is the seam.
 */
export interface LeadStore {
  save(lead: StoredLead): Promise<void>;
  all(): Promise<StoredLead[]>;
}

export class JsonlLeadStore implements LeadStore {
  constructor(private readonly path: string) {}

  async save(lead: StoredLead): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    await appendFile(this.path, `${JSON.stringify(lead)}\n`, 'utf8');
  }

  async all(): Promise<StoredLead[]> {
    let raw: string;
    try {
      raw = await readFile(this.path, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
    const leads: StoredLead[] = [];
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      try {
        leads.push(JSON.parse(line) as StoredLead);
      } catch {
        // A partially written final line can't invalidate the whole file.
      }
    }
    return leads.reverse();
  }
}

const CSV_COLUMNS = [
  'id', 'createdAt', 'priority', 'tier', 'score', 'firstName', 'lastName', 'email',
  'phone', 'street', 'city', 'state', 'zip', 'monthlyBill', 'propertyType', 'shade',
  'roofDirection', 'roofAge', 'utility', 'timeline', 'creditBand', 'bestTimeToCall',
  'systemSizeKw', 'firstYearSavings', 'consent', 'utmSource', 'utmCampaign', 'notes',
] as const;

const escapeCsv = (value: unknown): string => {
  // Prefix formula characters so a lead can't inject a spreadsheet formula
  // into the sales team's CSV export.
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export function leadsToCsv(leads: StoredLead[]): string {
  const rows = leads.map((lead) => [
    lead.id, lead.createdAt, lead.priority, lead.tier, lead.score,
    lead.contact.firstName, lead.contact.lastName, lead.contact.email, lead.contact.phone,
    lead.contact.street, lead.contact.city,
    lead.answers.stateOverride ?? stateFromZip(lead.answers.zip) ?? '', lead.answers.zip,
    lead.answers.monthlyBill, lead.answers.propertyType, lead.answers.shade,
    lead.answers.roofDirection, lead.answers.roofAge, lead.answers.utility ?? '',
    lead.answers.timeline, lead.answers.creditBand, lead.contact.bestTimeToCall,
    lead.estimate?.systemSizeKw ?? '', lead.estimate?.firstYearSavings ?? '',
    lead.contact.consent ? 'yes' : 'no', lead.source.utm.utm_source ?? '',
    lead.source.utm.utm_campaign ?? '', lead.contact.notes ?? '',
  ].map(escapeCsv).join(','));

  return [CSV_COLUMNS.join(','), ...rows].join('\n');
}
