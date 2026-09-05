import { useEffect, useMemo, useRef, useState } from 'react';
import type { QualifierAnswers } from '../../shared/types.ts';
import { STATES, stateFromZip } from '../../shared/geo.ts';
import { zipSchema } from '../../shared/validation.ts';
import { OptionList } from '../components/OptionList.tsx';
import { ArrowIcon, BackIcon, LockIcon } from '../components/Icons.tsx';
import {
  BILL_PRESETS, CREDIT_CHOICES, DIRECTION_CHOICES, PROPERTY_CHOICES, ROOF_AGE_CHOICES,
  SHADE_CHOICES, STEP_IDS, TIMELINE_CHOICES, UTILITIES_BY_STATE, type StepId,
} from './steps.ts';

export type Draft = Partial<QualifierAnswers>;

const STORAGE_KEY = 'marketron.solar.draft.v1';

/** Where the bill slider starts, and the value recorded if it is never moved. */
const DEFAULT_BILL = 150;

/** Steps a renter never sees - once they say they rent, the roof is moot. */
const ROOF_STEPS: StepId[] = ['shade', 'direction', 'roofAge'];

function loadDraft(): Draft {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
}

interface Props {
  onComplete: (answers: QualifierAnswers) => void;
}

export function Wizard({ onComplete }: Props) {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const steps = useMemo<StepId[]>(
    () => (draft.propertyType === 'rent' ? STEP_IDS.filter((s) => !ROOF_STEPS.includes(s)) : [...STEP_IDS]),
    [draft.propertyType],
  );
  const step = steps[Math.min(index, steps.length - 1)] as StepId;

  // Persist progress so a homeowner who bounces mid-funnel can resume. Cleared
  // on submit by the parent.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Private browsing - resuming is a nicety, never block the funnel on it.
    }
  }, [draft]);

  // The bill slider renders at a default position, so commit that default to
  // the draft as soon as the step is shown. Without this the homeowner sees
  // "$150" and is then told to choose a bill when they accept it and continue.
  useEffect(() => {
    if (step === 'bill' && draft.monthlyBill === undefined) {
      setDraft((prev) => ({ ...prev, monthlyBill: DEFAULT_BILL }));
    }
  }, [step, draft.monthlyBill]);

  // Move focus to the new question so screen readers and keyboard users follow
  // the step change, but don't steal focus on the very first paint.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [index]);

  const detectedState = draft.zip ? stateFromZip(draft.zip) : null;
  const stateName = detectedState ? STATES[detectedState]?.name : undefined;

  function set<K extends keyof QualifierAnswers>(key: K, value: QualifierAnswers[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  /** Pick an answer and advance in one tap - the single biggest funnel win. */
  function choose<K extends keyof QualifierAnswers>(key: K, value: QualifierAnswers[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setError(null);
    window.setTimeout(() => advance({ ...draft, [key]: value }), 160);
  }

  function advance(current: Draft = draft) {
    const problem = validate(step, current);
    if (problem) {
      setError(problem);
      return;
    }
    // A renter's remaining questions are skipped, so recompute the step list
    // from the answers we're advancing with rather than the render-time one.
    const nextSteps = current.propertyType === 'rent'
      ? STEP_IDS.filter((s) => !ROOF_STEPS.includes(s))
      : [...STEP_IDS];
    const position = nextSteps.indexOf(step);
    if (position === nextSteps.length - 1) {
      onComplete(current as QualifierAnswers);
      return;
    }
    setIndex(position + 1);
  }

  function back() {
    setError(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  const progress = Math.round(((index + 1) / steps.length) * 100);

  return (
    <div className="card wizard">
      <div className="wizard__progress">
        <div className="wizard__progress-meta">
          <span>Step {index + 1} of {steps.length}</span>
          <span>{progress}%</span>
        </div>
        <div
          className="wizard__track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Qualifier progress"
        >
          <div className="wizard__bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="wizard__body">
        <h2 className="wizard__question" id={`${step}-label`} tabIndex={-1} ref={headingRef}>
          {QUESTIONS[step].title}
        </h2>
        <p className="wizard__help">
          {step === 'utility' && stateName
            ? `Rates vary a lot between utilities in ${stateName}. This makes your estimate far more accurate.`
            : QUESTIONS[step].help}
        </p>

        {step === 'zip' && (
          <div className="field">
            <label htmlFor="zip">ZIP code</label>
            <input
              id="zip"
              className="input input--zip"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder="00000"
              value={draft.zip ?? ''}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'zip-error' : 'zip-detected'}
              onChange={(e) => set('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
              onKeyDown={(e) => e.key === 'Enter' && advance()}
              autoFocus
            />
            <p className="field__hint" id="zip-detected">
              {stateName ? `Detected: ${stateName}` : 'We use this to look up your local sun hours, power prices, and incentives.'}
            </p>
          </div>
        )}

        {step === 'bill' && (
          <BillStep value={draft.monthlyBill ?? DEFAULT_BILL} onChange={(v) => set('monthlyBill', v)} />
        )}

        {step === 'property' && (
          <OptionList name="property" choices={PROPERTY_CHOICES} value={draft.propertyType}
            onSelect={(v) => choose('propertyType', v)} />
        )}
        {step === 'shade' && (
          <OptionList name="shade" choices={SHADE_CHOICES} value={draft.shade}
            onSelect={(v) => choose('shade', v)} />
        )}
        {step === 'direction' && (
          <OptionList name="direction" choices={DIRECTION_CHOICES} value={draft.roofDirection}
            columns={2} onSelect={(v) => choose('roofDirection', v)} />
        )}
        {step === 'roofAge' && (
          <OptionList name="roofAge" choices={ROOF_AGE_CHOICES} value={draft.roofAge}
            onSelect={(v) => choose('roofAge', v)} />
        )}
        {step === 'timeline' && (
          <OptionList name="timeline" choices={TIMELINE_CHOICES} value={draft.timeline}
            onSelect={(v) => choose('timeline', v)} />
        )}
        {step === 'credit' && (
          <OptionList name="credit" choices={CREDIT_CHOICES} value={draft.creditBand}
            onSelect={(v) => choose('creditBand', v)} />
        )}

        {step === 'utility' && (
          <div className="field">
            <label htmlFor="utility">Electric utility</label>
            <input
              id="utility"
              className="input"
              list="utility-options"
              placeholder="Start typing your provider"
              value={draft.utility ?? ''}
              onChange={(e) => set('utility', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && advance()}
              autoFocus
            />
            <datalist id="utility-options">
              {(detectedState ? UTILITIES_BY_STATE[detectedState] ?? [] : []).map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <p className="field__hint">Optional - skip it if you're not sure and we'll look it up.</p>
          </div>
        )}

        {error && (
          <p className="error-text" id="zip-error" role="alert" style={{ marginTop: 12 }}>{error}</p>
        )}
      </div>

      <div className="wizard__footer">
        {index > 0 ? (
          <button type="button" className="btn btn--ghost" onClick={back}>
            <BackIcon /> Back
          </button>
        ) : (
          <span className="wizard__reassure"><LockIcon /> No obligation. No credit check.</span>
        )}
        <button type="button" className="btn btn--primary" onClick={() => advance()}>
          {index === steps.length - 1 ? 'See my results' : 'Continue'} <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

function BillStep({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="bill-readout">
        <strong>${value}{value >= 500 ? '+' : ''}</strong>
        <span>average monthly electric bill</span>
      </div>
      <input
        type="range"
        className="slider"
        min={40}
        max={500}
        step={5}
        value={Math.min(500, value)}
        aria-label="Average monthly electric bill in dollars"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-scale"><span>$40</span><span>$500+</span></div>
      <div className="bill-presets">
        {BILL_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="chip"
            aria-pressed={value === preset}
            onClick={() => onChange(preset)}
          >
            ${preset}
          </button>
        ))}
      </div>
    </div>
  );
}

const QUESTIONS: Record<StepId, { title: string; help: string }> = {
  zip: {
    title: "Let's start with where you live",
    help: 'Sunlight, electricity rates, and solar incentives all change by state - so your ZIP does most of the work here.',
  },
  bill: {
    title: "What's your average monthly electric bill?",
    help: 'A rough number is fine. This is what solar is offsetting, so it drives the whole estimate.',
  },
  property: {
    title: 'Do you own the property?',
    help: 'Solar is a 25-year asset attached to the roof, so ownership decides which options are open to you.',
  },
  shade: {
    title: 'How much shade does your roof get?',
    help: 'Think about a typical sunny day - do trees, chimneys, or neighbouring buildings cover the roof?',
  },
  direction: {
    title: 'Which way does most of your roof face?',
    help: "Not sure? Pick \"I'm not sure\" - we confirm it from satellite imagery before anyone quotes you.",
  },
  roofAge: {
    title: 'How old is your roof?',
    help: 'Panels outlast most roofs. If yours is near the end of its life, it is usually cheaper to replace it first.',
  },
  utility: {
    title: 'Who is your electric utility?',
    help: 'Rates vary a lot between utilities. This makes your estimate far more accurate.',
  },
  timeline: {
    title: 'When are you looking to go solar?',
    help: 'This just tells us how quickly to get back to you. Researching is a perfectly good answer.',
  },
  credit: {
    title: 'How would you describe your credit?',
    help: 'This is a rough band only - no credit check, no impact on your score. It tells us which financing options to show you.',
  },
};

function validate(step: StepId, draft: Draft): string | null {
  switch (step) {
    case 'zip': {
      const result = zipSchema.safeParse(draft.zip ?? '');
      return result.success ? null : result.error.issues[0]?.message ?? 'Enter a valid ZIP code';
    }
    case 'bill':
      return draft.monthlyBill && draft.monthlyBill >= 20 ? null : 'Choose your average monthly bill';
    case 'property':
      return draft.propertyType ? null : 'Choose one to continue';
    case 'shade':
      return draft.shade ? null : 'Choose one to continue';
    case 'direction':
      return draft.roofDirection ? null : 'Choose one to continue';
    case 'roofAge':
      return draft.roofAge ? null : 'Choose one to continue';
    case 'timeline':
      return draft.timeline ? null : 'Choose one to continue';
    case 'credit':
      return draft.creditBand ? null : 'Choose one to continue';
    case 'utility':
      return null;
  }
}

/** Called once a lead is captured so a returning visitor starts fresh. */
export function clearDraft(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

/**
 * A renter skips the roof questions, so those answers are never collected.
 * Fill in neutral placeholders before scoring - `evaluate` short-circuits on
 * `propertyType === 'rent'` anyway, but the schema still expects the shape.
 */
export function withDefaults(draft: Draft): QualifierAnswers {
  return {
    zip: draft.zip ?? '',
    monthlyBill: draft.monthlyBill ?? DEFAULT_BILL,
    propertyType: draft.propertyType ?? 'own_home',
    shade: draft.shade ?? 'light',
    roofDirection: draft.roofDirection ?? 'not_sure',
    roofAge: draft.roofAge ?? 'not_sure',
    utility: draft.utility?.trim() || undefined,
    timeline: draft.timeline ?? 'researching',
    creditBand: draft.creditBand ?? 'not_sure',
    stateOverride: draft.stateOverride,
  };
}
