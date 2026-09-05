import type { FitResult } from '../../shared/types.ts';
import { INCENTIVES } from '../../shared/incentives.ts';
import { AlertIcon, ArrowIcon, CheckIcon } from '../components/Icons.tsx';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

const TIER_LABEL: Record<FitResult['tier'], string> = {
  excellent: 'Excellent fit',
  strong: 'Strong fit',
  moderate: 'Workable fit',
  limited: 'Limited fit',
  not_yet: 'Not a rooftop fit',
};

/** Green above 70, amber in the middle, grey when a factor is holding you back. */
function factorColor(value: number): string {
  if (value >= 0.7) return 'var(--teal-600)';
  if (value >= 0.45) return 'var(--amber-500)';
  return '#9aa8b5';
}

interface Props {
  result: FitResult;
  onContinue: () => void;
}

export function Results({ result, onContinue }: Props) {
  const { estimate } = result;
  const circumference = 2 * Math.PI * 64;

  return (
    <div className="card results">
      <div className="result-hero">
        <div className="gauge">
          <svg width="148" height="148" role="img" aria-label={`Solar fit score ${result.score} out of 100`}>
            <circle cx="74" cy="74" r="64" stroke="rgba(255,255,255,0.16)" strokeWidth="12" fill="none" />
            <circle
              cx="74" cy="74" r="64"
              stroke="var(--amber-500)" strokeWidth="12" fill="none" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - result.score / 100)}
              style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,0.8,0.3,1)' }}
            />
          </svg>
          <div className="gauge__value">
            <strong>{result.score}</strong>
            <span>Solar score</span>
          </div>
        </div>
        <div>
          <span className={`tier-badge tier-badge--${result.tier}`}>{TIER_LABEL[result.tier]}</span>
          <h2>{result.headline}</h2>
          <p>{result.summary}</p>
        </div>
      </div>

      {estimate && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <div className="stat__label">Estimated system</div>
              <div className="stat__value">{estimate.systemSizeKw} kW</div>
              <div className="stat__note">about {estimate.panelCount} panels</div>
            </div>
            <div className="stat">
              <div className="stat__label">Bill offset</div>
              <div className="stat__value">{estimate.offsetPercent}%</div>
              <div className="stat__note">{estimate.annualProductionKwh.toLocaleString('en-US')} kWh a year</div>
            </div>
            <div className="stat">
              <div className="stat__label">Monthly savings</div>
              <div className="stat__value">{money(estimate.monthlySavings)}</div>
              <div className="stat__note">{money(estimate.firstYearSavings)} in year one</div>
            </div>
            <div className="stat">
              <div className="stat__label">Payback</div>
              <div className="stat__value">{estimate.paybackYears ? `${estimate.paybackYears} yrs` : 'n/a'}</div>
              <div className="stat__note">on a cash purchase</div>
            </div>
            <div className="stat">
              <div className="stat__label">25-year savings</div>
              <div className="stat__value">{money(Math.max(0, estimate.lifetimeSavings))}</div>
              <div className="stat__note">net of system cost</div>
            </div>
            <div className="stat">
              <div className="stat__label">Installed cost</div>
              <div className="stat__value">{money(estimate.netCost)}</div>
              <div className="stat__note">
                {estimate.federalCredit > 0
                  ? `after a ${money(estimate.federalCredit)} federal credit`
                  : 'before state and utility incentives'}
              </div>
            </div>
          </div>

          <div className="section">
            <h3>What's driving your score</h3>
            {result.factors.map((factor) => (
              <div className="factor" key={factor.key}>
                <div className="factor__head">
                  <span className="factor__name">{factor.label}</span>
                  <span className="factor__points">{factor.points} / {factor.maxPoints} pts</span>
                </div>
                <div className="factor__track">
                  <div
                    className="factor__fill"
                    style={{ width: `${Math.round(factor.value * 100)}%`, background: factorColor(factor.value) }}
                  />
                </div>
                <p className="factor__detail">{factor.detail}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {result.alternative && (
        <div className="section">
          <h3>{result.alternative.headline}</h3>
          <p style={{ color: 'var(--ink-soft)' }}>{result.alternative.body}</p>
        </div>
      )}

      {(result.strengths.length > 0 || result.watchouts.length > 0) && (
        <div className="section">
          {result.strengths.length > 0 && (
            <>
              <h3>Working in your favour</h3>
              <ul className="notes notes--good" style={{ marginBottom: result.watchouts.length ? 22 : 0 }}>
                {result.strengths.map((text) => (
                  <li key={text}><CheckIcon size={17} />{text}</li>
                ))}
              </ul>
            </>
          )}
          {result.watchouts.length > 0 && (
            <>
              <h3>Worth knowing before you buy</h3>
              <ul className="notes notes--warn">
                {result.watchouts.map((text) => (
                  <li key={text}><AlertIcon size={17} />{text}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="section" style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.3rem' }}>Want a real quote for your roof?</h3>
        <p style={{ color: 'var(--ink-soft)', maxWidth: '46ch', margin: '0 auto 20px' }}>
          A local solar expert will confirm these numbers against your actual roof and utility rate -
          and tell you honestly if it isn't worth it.
        </p>
        <button type="button" className="btn btn--primary btn--lg" onClick={onContinue}>
          Talk to a solar expert <ArrowIcon />
        </button>
      </div>

      <p className="disclaimer">
        <strong>How this estimate was made.</strong> We size a system from your reported bill and the
        average residential electricity rate in {result.state.name}, derate production for your roof's
        shading and orientation, and value the output using local net metering rules. Lifetime figures
        assume {(INCENTIVES.utilityEscalation * 100).toFixed(1)}% annual utility rate increases and{' '}
        {(INCENTIVES.panelDegradation * 100).toFixed(1)}% annual panel degradation over{' '}
        {INCENTIVES.analysisYears} years. {INCENTIVES.federalNote} {result.state.policyNote} This is a
        planning estimate for comparison only, not a quote, an offer of financing, or tax advice.
        Your actual results depend on a site survey, your utility tariff, and your tax situation.
      </p>
    </div>
  );
}
