import { useEffect, useMemo, useState } from 'react';
import type { StoredLead } from '../../shared/types.ts';
import { SiteHeader } from '../components/Layout.tsx';
import { AlertIcon } from '../components/Icons.tsx';

const TOKEN_KEY = 'marketron.admin.token';

const formatPhone = (digits: string) =>
  digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : digits;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

type Filter = 'all' | 'hot' | 'warm' | 'nurture';

/**
 * Lead desk for the sales team. Deliberately read-only: the source of truth for
 * lead status is whatever CRM you forward to, and two systems both claiming to
 * own lead status is how leads get dropped.
 */
export function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? '');
  const [input, setInput] = useState('');
  const [leads, setLeads] = useState<StoredLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/leads', { headers: { authorization: `Bearer ${token}` } });
        if (cancelled) return;
        if (response.status === 401) {
          sessionStorage.removeItem(TOKEN_KEY);
          setToken('');
          setError('That token was rejected.');
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setLeads((await response.json()) as StoredLead[]);
        setError(null);
      } catch {
        if (!cancelled) setError('Could not load leads. Is the API running?');
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  const visible = useMemo(() => {
    if (!leads) return [];
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filter !== 'all' && lead.priority !== filter) return false;
      if (!needle) return true;
      return [
        lead.contact.firstName, lead.contact.lastName, lead.contact.email,
        lead.contact.phone, lead.contact.city, lead.answers.zip,
      ].join(' ').toLowerCase().includes(needle);
    });
  }, [leads, filter, query]);

  const counts = useMemo(() => ({
    all: leads?.length ?? 0,
    hot: leads?.filter((l) => l.priority === 'hot').length ?? 0,
    warm: leads?.filter((l) => l.priority === 'warm').length ?? 0,
    nurture: leads?.filter((l) => l.priority === 'nurture').length ?? 0,
  }), [leads]);

  if (!token) {
    return (
      <>
        <SiteHeader />
        <div className="admin login">
          <div className="card card--flat" style={{ padding: 26 }}>
            <h2 style={{ marginBottom: 8 }}>Lead desk</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: 18 }}>
              Enter the admin token from your server environment.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sessionStorage.setItem(TOKEN_KEY, input.trim());
                setToken(input.trim());
              }}
            >
              <div className="field">
                <label htmlFor="token">Admin token</label>
                <input id="token" className="input" type="password" autoComplete="off"
                  value={input} onChange={(e) => setInput(e.target.value)} />
              </div>
              {error && <p className="error-text" style={{ marginTop: 10 }}><AlertIcon size={15} />{error}</p>}
              <button type="submit" className="btn btn--primary btn--block" style={{ marginTop: 16 }}>
                Sign in
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="admin">
        <div className="admin__head">
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>Lead desk</h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
              {counts.all} lead{counts.all === 1 ? '' : 's'} · {counts.hot} hot · {counts.warm} warm
            </p>
          </div>
          <div className="admin__filters">
            <input className="input" style={{ width: 210, padding: '9px 13px' }} placeholder="Search leads"
              value={query} onChange={(e) => setQuery(e.target.value)} />
            {(['all', 'hot', 'warm', 'nurture'] as Filter[]).map((option) => (
              <button key={option} type="button" className="chip" aria-pressed={filter === option}
                onClick={() => setFilter(option)}>
                {option} ({counts[option]})
              </button>
            ))}
            <a className="btn btn--primary" style={{ padding: '9px 18px' }}
              href={`/api/leads.csv?token=${encodeURIComponent(token)}`}>
              Export CSV
            </a>
          </div>
        </div>

        {error && <div className="alert" role="alert" style={{ marginBottom: 16 }}><AlertIcon size={17} />{error}</div>}

        {leads === null && !error && <p style={{ color: 'var(--ink-soft)' }}>Loading leads…</p>}

        {leads !== null && visible.length === 0 && (
          <div className="card card--flat" style={{ padding: 34, textAlign: 'center', color: 'var(--ink-soft)' }}>
            {counts.all === 0 ? 'No leads captured yet. Submissions show up here instantly.' : 'No leads match this filter.'}
          </div>
        )}

        {visible.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Received</th><th>Priority</th><th>Score</th><th>Name</th><th>Contact</th>
                  <th>Location</th><th>Bill</th><th>System</th><th>Yr 1 savings</th>
                  <th>Timeline</th><th>Best time</th><th>Source</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((lead) => (
                  <tr key={lead.id}>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td><span className={`pill pill--${lead.priority}`}>{lead.priority}</span></td>
                    <td><strong>{lead.score}</strong></td>
                    <td>{lead.contact.firstName} {lead.contact.lastName}</td>
                    <td>
                      <a href={`tel:${lead.contact.phone}`}>{formatPhone(lead.contact.phone)}</a>
                      <br />
                      <a href={`mailto:${lead.contact.email}`} style={{ fontSize: '0.82rem' }}>{lead.contact.email}</a>
                    </td>
                    <td>{lead.contact.city}, {lead.answers.zip}</td>
                    <td>${lead.answers.monthlyBill}/mo</td>
                    <td>{lead.estimate ? `${lead.estimate.systemSizeKw} kW` : '—'}</td>
                    <td>{lead.estimate ? `$${lead.estimate.firstYearSavings.toLocaleString('en-US')}` : '—'}</td>
                    <td>{lead.answers.timeline.replace(/_/g, ' ')}</td>
                    <td>{lead.contact.bestTimeToCall}</td>
                    <td>{lead.source.utm.utm_source ?? lead.source.referrer ?? 'direct'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
