import type { Choice } from '../funnel/steps.ts';

interface Props<T extends string> {
  name: string;
  choices: Choice<T>[];
  value: T | undefined;
  onSelect: (value: T) => void;
  columns?: 1 | 2;
}

/**
 * Radio-group semantics on buttons: the whole card is the hit target (better on
 * mobile than a native radio), while `aria-pressed` and arrow-key navigation
 * keep it usable with a keyboard and a screen reader.
 */
export function OptionList<T extends string>({ name, choices, value, onSelect, columns = 1 }: Props<T>) {
  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1
      : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1
      : 0;
    if (delta === 0) return;
    event.preventDefault();
    const next = (index + delta + choices.length) % choices.length;
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button.option');
    buttons?.[next]?.focus();
  }

  return (
    <div className={`options${columns === 2 ? ' options--two' : ''}`} role="group" aria-labelledby={`${name}-label`}>
      {choices.map((choice, index) => (
        <button
          key={choice.value}
          type="button"
          className="option"
          aria-pressed={value === choice.value}
          onClick={() => onSelect(choice.value)}
          onKeyDown={(event) => onKeyDown(event, index)}
        >
          <span className="option__icon" aria-hidden="true">{choice.icon}</span>
          <span className="option__label">
            {choice.label}
            {choice.hint && <span className="option__hint">{choice.hint}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
