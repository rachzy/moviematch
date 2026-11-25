'use client';

import { useId, useState } from 'react';

type Props = {
  value: number; // 0 = sem nota
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
};

const STARS = [1, 2, 3, 4, 5];

export function StarRating({
  value,
  onChange,
  disabled,
  label = 'Sua nota',
}: Props) {
  const name = useId();
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div
      className="stars"
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(0)}
    >
      {STARS.map((n) => (
        <label
          key={n}
          className={n <= shown ? 'star on' : 'star'}
          onMouseEnter={() => !disabled && setHover(n)}
        >
          <input
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            disabled={disabled}
            onChange={() => onChange(n)}
          />
          <span aria-hidden="true">★</span>
          <span className="sr-only">
            {n} {n === 1 ? 'estrela' : 'estrelas'}
          </span>
        </label>
      ))}
    </div>
  );
}
