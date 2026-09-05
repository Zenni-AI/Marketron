import { randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import { evaluate, priorityFor } from '../shared/solar-engine.ts';
import { answersSchema, fieldErrors, leadSchema } from '../shared/validation.ts';
import type { StoredLead } from '../shared/types.ts';
import { JsonlLeadStore, leadsToCsv } from './store.ts';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT ?? 5174);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '';
const store = new JsonlLeadStore(resolve(rootDir, process.env.LEAD_STORE_PATH ?? 'data/leads.jsonl'));

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '64kb' }));

/**
 * Small in-memory rate limit. Lead forms are a spam magnet, and one IP has no
 * legitimate reason to submit more than a handful of quotes an hour. Put a real
 * limiter (or your CDN's) in front of this if you run more than one instance.
 */
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 12 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.get('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : String(req.query.token ?? '');
  const expected = ADMIN_TOKEN;
  const ok = expected.length > 0
    && provided.length === expected.length
    && timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  if (!ok) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, adminConfigured: ADMIN_TOKEN.length > 0 });
});

/**
 * Score a home. The client scores locally for instant feedback; this endpoint
 * exists so the same result can be produced from a partner integration, an
 * email retargeting job, or a server-rendered landing page.
 */
app.post('/api/evaluate', (req, res) => {
  const parsed = answersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid answers', fields: fieldErrors(parsed.error) });
    return;
  }
  res.json(evaluate(parsed.data));
});

app.post('/api/leads', async (req, res) => {
  const ip = req.ip ?? 'unknown';
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'Too many submissions. Please call us instead.' });
    return;
  }

  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Please check the highlighted fields', fields: fieldErrors(parsed.error) });
    return;
  }

  // Honeypot: silently accept so bots don't learn to work around it.
  if (parsed.data.website) {
    res.status(201).json({ id: randomUUID(), priority: 'nurture' });
    return;
  }

  const { answers, contact, utm, referrer } = parsed.data;
  const result = evaluate(answers);
  const lead: StoredLead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    answers,
    contact,
    score: result.score,
    tier: result.tier,
    estimate: result.estimate,
    priority: priorityFor(result.score, answers),
    source: { referrer, utm, userAgent: req.get('user-agent'), ip },
  };

  try {
    await store.save(lead);
  } catch (error) {
    console.error('[leads] failed to persist lead', error);
    res.status(500).json({ error: 'We could not save your request. Please call us and we will take it by phone.' });
    return;
  }

  void forwardToCrm(lead);
  res.status(201).json({ id: lead.id, priority: lead.priority });
});

app.get('/api/leads', requireAdmin, async (_req, res) => {
  res.json(await store.all());
});

app.get('/api/leads.csv', requireAdmin, async (_req, res) => {
  const csv = leadsToCsv(await store.all());
  res.setHeader('content-type', 'text/csv; charset=utf-8');
  res.setHeader('content-disposition', `attachment; filename="solar-leads-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

/**
 * Fire-and-forget CRM handoff. A CRM outage must never cost us a lead, so the
 * lead is already on disk before this runs and a failure is only logged.
 */
async function forwardToCrm(lead: StoredLead): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.LEAD_WEBHOOK_SECRET ? { 'x-webhook-secret': process.env.LEAD_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(`[leads] CRM webhook returned ${response.status} for lead ${lead.id}`);
    }
  } catch (error) {
    console.error(`[leads] CRM webhook failed for lead ${lead.id}`, error);
  }
}

// In production the API also serves the built front end, so the whole funnel
// runs from one process on one port.
const distDir = join(rootDir, 'dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`[marketron-solar] lead API listening on http://localhost:${PORT}`);
  if (!ADMIN_TOKEN) {
    console.warn('[marketron-solar] ADMIN_TOKEN is not set - /admin and the lead export are disabled.');
  }
});

export { app };
