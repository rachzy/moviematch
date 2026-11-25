import type { SearchBy } from '../types';
import { SearchIcon } from './icons';

const OPTIONS: [string, SearchBy | null][] = [
  ['Filme ou ator', null],
  ['Nome do filme', 'title'],
  ['Ator ou atriz', 'actor'],
];

type Props = {
  value: SearchBy | null;
  onChange: (by: SearchBy | null) => void;
};

// Escolhe se o texto da busca é o nome do filme, do ator, ou os dois.
export function SearchByFilter({ value, onChange }: Props) {
  return (
    <div className="genre-filter search-by">
      <span className="genre-label">
        <SearchIcon size={16} /> Buscar por
      </span>
      {OPTIONS.map(([label, by]) => (
        <button
          key={label}
          type="button"
          className="chip"
          aria-pressed={value === by}
          onClick={() => onChange(by)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
