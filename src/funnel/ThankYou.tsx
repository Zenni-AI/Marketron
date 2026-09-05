import type { FitResult, QualifierAnswers } from '../../shared/types.ts';
import { BRAND } from '../config.ts';
import { CheckIcon, PhoneIcon } from '../components/Icons.tsx';

interface Props {
  result: FitResult;
  answers: QualifierAnswers;
  onRestart: () => void;
}

export function ThankYou({ result, answers, onRestart }: Props) {
  const isRenter = answers.propertyType === 'rent';
  const urgent = answers.timeline === 'asap' || answers.timeline === '1_to_3_months';

  return (
    <div className="card thanks">
      <div className="thanks__mark"><CheckIcon size={36} /></div>
      <h2>You're all set - our solar experts will reach out</h2>
      <p>
        {isRenter
          ? `We're checking which community solar projects have capacity near ${result.state.name}. Expect an email shortly.`
          : `A licensed solar specialist who works in ${result.state.name} will call you ${
              urgent ? 'within one business day' : 'in the next two business days'
            } to go through your ${result.score}/100 result and put real numbers on your roof.`}
      </p>

      <div className="next-steps">
        <div className="next-step">
          <span className="next-step__num">1</span>
          <div>
            <strong>We review your roof</strong>
            <span>Satellite imagery and your utility's current rate schedule, before we call.</span>
          </div>
        </div>
        <div className="next-step">
          <span className="next-step__num">2</span>
          <div>
            <strong>A specialist calls you</strong>
            <span>
              {answers.propertyType === 'rent'
                ? 'To walk you through the community solar options open to renters.'
                : 'A no-pressure conversation about system size, financing, and whether it is worth doing at all.'}
            </span>
          </div>
        </div>
        <div className="next-step">
          <span className="next-step__num">3</span>
          <div>
            <strong>You get a written quote</strong>
            <span>A firm design and price you can compare - yours to keep, with no obligation.</span>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 28, fontSize: '0.92rem' }}>
        In a hurry? Call us on{' '}
        <a href={BRAND.phoneHref} style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          <PhoneIcon size={14} /> {BRAND.phone}
        </a>
      </p>
      <p style={{ marginTop: 18 }}>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Check another property
        </button>
      </p>
    </div>
  );
}
