import { useState } from 'react';
import type { FitResult, QualifierAnswers } from '../../shared/types.ts';
import { contactSchema, fieldErrors } from '../../shared/validation.ts';
import { BRAND, CONSENT_TEXT } from '../config.ts';
import { AlertIcon, ArrowIcon, BackIcon, LockIcon } from '../components/Icons.tsx';

const CALL_TIMES = ['anytime', 'morning', 'afternoon', 'evening', 'weekends only'];

interface Props {
  answers: QualifierAnswers;
  result: FitResult;
  onBack: () => void;
  onSubmitted: () => void;
}

/**
 * The server validates the whole lead envelope, so its field paths are nested
 * ("contact.email"). The form's inputs are keyed by bare field name, so strip
 * the prefix or a server-side rejection renders nowhere and the submit button
 * appears to do nothing. Answer-level problems can't be fixed from this screen,
 * so they surface as the form-level message instead.
 */
function unprefix(fields: Record<string, string> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [path, message] of Object.entries(fields ?? {})) {
    if (path.startsWith('contact.')) out[path.slice('contact.'.length)] = message;
  }
  return out;
}

/** UTM params are read at submit time so an ad click is attributable to a lead. */
function collectUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const [key, value] of params) {
    if (key.startsWith('utm_') || key === 'gclid' || key === 'fbclid' || key === 'msclkid') {
      utm[key] = value.slice(0, 200);
    }
  }
  return utm;
}

export function ContactForm({ answers, result, onBack, onSubmitted }: Props) {
  const [values, setValues] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', bestTimeToCall: 'anytime', notes: '', website: '',
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRenter = answers.propertyType === 'rent';

  /**
   * Clear a field's error as soon as it is edited. Leaving "First name is
   * required" sitting under a filled-in name makes a working form look broken,
   * and it trains people to ignore the messages that still matter.
   */
  const clearError = (key: string) =>
    setErrors((prev) => (key in prev ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)) : prev));

  const update = (key: keyof typeof values) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    clearError(key);
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const contact = contactSchema.safeParse({
      ...values,
      notes: values.notes || undefined,
      consent,
      consentText: CONSENT_TEXT,
    });
    if (!contact.success) {
      const fields = fieldErrors(contact.error);
      setErrors(fields);
      // Take the reader to the first thing they need to fix.
      const firstKey = Object.keys(fields)[0];
      if (firstKey) document.getElementById(firstKey)?.focus();
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers,
          contact: contact.data,
          utm: collectUtm(),
          referrer: document.referrer || undefined,
          website: values.website,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
        setErrors(unprefix(body.fields));
        setFormError(body.error ?? 'Something went wrong on our end. Please try again.');
        return;
      }
      onSubmitted();
    } catch {
      setFormError(
        `We couldn't reach our servers. Check your connection and try again, or call us on ${BRAND.phone}.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const err = (key: string) =>
    errors[key] ? <p className="error-text" id={`${key}-error`}><AlertIcon size={15} />{errors[key]}</p> : null;
  const inputProps = (key: string) => ({
    id: key,
    className: 'input',
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  });

  return (
    <div className="card">
      <div className="wizard__body">
        <h2 className="wizard__question">
          {isRenter ? 'Where should we send your community solar options?' : 'Where should our solar expert reach you?'}
        </h2>
        <p className="wizard__help">
          {isRenter
            ? 'We will check which community solar projects have capacity near you and email you what we find.'
            : `You scored ${result.score}/100. A local specialist will confirm these numbers against your roof and your actual utility rate - free, and with no obligation to buy.`}
        </p>

        <form onSubmit={submit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="firstName">First name</label>
              <input {...inputProps('firstName')} autoComplete="given-name" value={values.firstName} onChange={update('firstName')} />
              {err('firstName')}
            </div>
            <div className="field">
              <label htmlFor="lastName">Last name</label>
              <input {...inputProps('lastName')} autoComplete="family-name" value={values.lastName} onChange={update('lastName')} />
              {err('lastName')}
            </div>
            <div className="field span-2">
              <label htmlFor="email">Email</label>
              <input {...inputProps('email')} type="email" autoComplete="email" inputMode="email" value={values.email} onChange={update('email')} />
              {err('email')}
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input {...inputProps('phone')} type="tel" autoComplete="tel" inputMode="tel" placeholder="(555) 123-4567" value={values.phone} onChange={update('phone')} />
              {err('phone')}
            </div>
            <div className="field">
              <label htmlFor="bestTimeToCall">Best time to call</label>
              <select id="bestTimeToCall" className="select" value={values.bestTimeToCall} onChange={update('bestTimeToCall')}>
                {CALL_TIMES.map((time) => (
                  <option key={time} value={time}>{time[0]?.toUpperCase()}{time.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="field span-2">
              <label htmlFor="street">Street address</label>
              <input {...inputProps('street')} autoComplete="address-line1" placeholder="123 Main St" value={values.street} onChange={update('street')} />
              <p className="field__hint">Used to pull satellite imagery of your roof before the call.</p>
              {err('street')}
            </div>
            <div className="field">
              <label htmlFor="city">City</label>
              <input {...inputProps('city')} autoComplete="address-level2" value={values.city} onChange={update('city')} />
              {err('city')}
            </div>
            <div className="field">
              <label htmlFor="zip-display">ZIP code</label>
              <input id="zip-display" className="input" value={answers.zip} readOnly aria-readonly="true" />
            </div>
            <div className="field span-2">
              <label htmlFor="notes">Anything we should know? <span style={{ fontWeight: 400, color: 'var(--ink-faint)' }}>(optional)</span></label>
              <textarea id="notes" className="textarea" value={values.notes} onChange={update('notes')}
                placeholder="Planning an EV, adding a pool, roof was replaced last year..." />
            </div>

            {/* Honeypot - hidden from people, irresistible to bots. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
            </div>

            <div className="span-2">
              <label className="consent">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? 'consent-error' : undefined}
                  onChange={(e) => { setConsent(e.target.checked); clearError('consent'); }}
                />
                <p>{CONSENT_TEXT}</p>
              </label>
              {err('consent')}
            </div>

            {formError && (
              <div className="span-2 alert" role="alert"><AlertIcon size={17} />{formError}</div>
            )}

            <div className="span-2">
              <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
                {submitting ? 'Sending...' : 'Get my free consultation'} {!submitting && <ArrowIcon />}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="wizard__footer">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          <BackIcon /> Back to my results
        </button>
        <span className="wizard__reassure"><LockIcon /> We never sell your data</span>
      </div>
    </div>
  );
}
