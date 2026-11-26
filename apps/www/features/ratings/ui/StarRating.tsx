'use client';

import { useId, useState } from 'react';

type Props = {
  value: number; // 0 = sem nota
  onChange: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean; // nota salva: aparência normal, sem interação
  label?: string;
};

const STARS = [1, 2, 3, 4, 5];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
      <path d="M12 2.8l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.7l-5.9 3.1 1.2-6.5L2.5 9.7l6.6-.9z" />
    </svg>
  );
}

export function StarRating({
  value,
  onChange,
  disabled,
  readOnly,
  label = 'Sua nota',
}: Props) {
  const name = useId();
  const [hover, setHover] = useState(0);
  const locked = disabled || readOnly;
  const shown = hover || value;

  return (
    <div
      className={readOnly ? 'stars readonly' : 'stars'}
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(0)}
    >
      {STARS.map((n) => (
        <label
          key={n}
          className={n <= shown ? 'star on' : 'star'}
          onMouseEnter={() => !locked && setHover(n)}
        >
          <input
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            disabled={locked}
            onChange={() => onChange(n)}
          />
          <StarIcon />
          <span className="sr-only">
            {n} {n === 1 ? 'estrela' : 'estrelas'}
          </span>
        </label>
      ))}
    </div>
  );
}
