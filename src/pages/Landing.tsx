import { useEffect, useRef, useState } from 'react';
import type { FitResult, QualifierAnswers } from '../../shared/types.ts';
import { evaluate } from '../../shared/solar-engine.ts';
import { Wizard, clearDraft, withDefaults } from '../funnel/Wizard.tsx';
import { Results } from '../funnel/Results.tsx';
import { ContactForm } from '../funnel/ContactForm.tsx';
import { ThankYou } from '../funnel/ThankYou.tsx';
import { Page } from '../components/Layout.tsx';
import { BoltIcon, CheckIcon, ShieldIcon, SunIcon, WalletIcon } from '../components/Icons.tsx';

type Stage = 'quiz' | 'results' | 'contact' | 'done';

export function Landing() {
  const [stage, setStage] = useState<Stage>('quiz');
  const [answers, setAnswers] = useState<QualifierAnswers | null>(null);
  const [result, setResult] = useState<FitResult | null>(null);
  const funnelRef = useRef<HTMLDivElement>(null);

  // Every stage change swaps the whole panel, so bring the top of it into view.
  useEffect(() => {
    if (stage !== 'quiz') funnelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stage]);

  function handleComplete(draft: QualifierAnswers) {
    const complete = withDefaults(draft);
    setAnswers(complete);
    setResult(evaluate(complete));
    setStage('results');
  }

  function restart() {
    clearDraft();
    setAnswers(null);
    setResult(null);
    setStage('quiz');
  }

  return (
    <Page>
      <section className="hero">
        <div className="shell hero__grid">
          <div>
            <span className="hero__eyebrow"><SunIcon size={14} /> Free 60-second solar check</span>
            <h1>See if your home is a <em>good fit for solar</em> - before you talk to anyone.</h1>
            <p className="hero__sub">
              Answer a few questions about your roof and your power bill. We'll score your home against
              local sun hours, electricity rates, and net metering rules - then show you the real numbers.
            </p>
            <ul className="hero__points">
              <li><CheckIcon size={17} /> An honest answer, including when solar <em>isn't</em> worth it</li>
              <li><CheckIcon size={17} /> No credit check and no obligation to buy</li>
              <li><CheckIcon size={17} /> Vetted local installers - never a call centre</li>
            </ul>
            <div className="trust-row">
              <div><strong>38,000+</strong><span>Homes checked</span></div>
              <div><strong>4.8/5</strong><span>Average installer rating</span></div>
              <div><strong>$0</strong><span>Cost to get your estimate</span></div>
            </div>
          </div>

          <div ref={funnelRef} id="funnel">
            {stage === 'quiz' && <Wizard onComplete={handleComplete} />}
            {stage === 'results' && result && (
              <Results result={result} onContinue={() => setStage('contact')} />
            )}
            {stage === 'contact' && result && answers && (
              <ContactForm
                answers={answers}
                result={result}
                onBack={() => setStage('results')}
                onSubmitted={() => { clearDraft(); setStage('done'); }}
              />
            )}
            {stage === 'done' && result && answers && (
              <ThankYou result={result} answers={answers} onRestart={restart} />
            )}
          </div>
        </div>
      </section>

      <section className="band band--tint">
        <div className="shell">
          <div className="band__head">
            <h2>Why homeowners start here</h2>
            <p>Most solar "calculators" are just a phone-number grab. This one shows you the maths first.</p>
          </div>
          <div className="grid-3">
            <div className="feature">
              <div className="feature__icon"><BoltIcon /></div>
              <h3>Scored on your actual conditions</h3>
              <p>
                Your ZIP sets the sun hours, retail electricity rate, and net metering rules. Your answers
                set the shading and orientation derate. Nothing is a national average.
              </p>
            </div>
            <div className="feature">
              <div className="feature__icon"><WalletIcon /></div>
              <h3>Savings, not a sales pitch</h3>
              <p>
                We show system size, payback period, and 25-year net savings - and we cap savings at what
                you actually spend, so the number can't be inflated.
              </p>
            </div>
            <div className="feature">
              <div className="feature__icon"><ShieldIcon /></div>
              <h3>You control the contact</h3>
              <p>
                An expert only calls if you ask for one. We don't sell your details, and you can opt out of
                follow-up at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell">
          <div className="band__head">
            <h2>How it works</h2>
          </div>
          <div className="grid-3">
            <div className="feature">
              <div className="feature__icon">1</div>
              <h3>Answer 9 quick questions</h3>
              <p>Roof, shade, bill, and timeline. About a minute, no account needed.</p>
            </div>
            <div className="feature">
              <div className="feature__icon">2</div>
              <h3>Get your solar score</h3>
              <p>A 0-100 fit score with a full breakdown of what helps and what hurts.</p>
            </div>
            <div className="feature">
              <div className="feature__icon">3</div>
              <h3>Talk to a local expert</h3>
              <p>Only if you want to. They confirm the numbers against your roof and your utility.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--tint">
        <div className="shell">
          <div className="band__head"><h2>Common questions</h2></div>
          <div className="faq">
            <details>
              <summary>Is this really free?</summary>
              <p>Yes. The estimate and the consultation cost nothing. Installers pay us when a homeowner
                chooses to work with them, which is why we can afford to tell you when solar isn't a good fit.</p>
            </details>
            <details>
              <summary>Will this affect my credit score?</summary>
              <p>No. We ask for a rough credit band so we can show you the right financing options.
                Nobody runs a credit check unless you later apply for a solar loan yourself.</p>
            </details>
            <details>
              <summary>How accurate is the savings estimate?</summary>
              <p>It's a planning estimate, not a quote. We derive your usage from your bill and your state's
                average electricity rate, then derate production for shading and roof orientation. A site
                survey and your actual utility tariff can move the numbers in either direction.</p>
            </details>
            <details>
              <summary>What if I rent?</summary>
              <p>Rooftop solar needs a roof you own, so we won't pretend otherwise. Tell us you rent and
                we'll check whether a community solar project has capacity near you instead.</p>
            </details>
            <details>
              <summary>How many companies will contact me?</summary>
              <p>Up to three vetted local installers, and only after you check the consent box. You can ask
                to be removed at any time and we'll stop.</p>
            </details>
          </div>
        </div>
      </section>
    </Page>
  );
}
