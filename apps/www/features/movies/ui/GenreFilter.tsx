import { GENRES } from '../genres';
import { TagIcon } from './icons';

type Props = {
  value: string | null;
  onChange: (genre: string | null) => void;
};

export function GenreFilter({ value, onChange }: Props) {
  const chip = (label: string, genre: string | null) => (
    <button
      key={label}
      type="button"
      className="chip"
      aria-pressed={value === genre}
      onClick={() => onChange(genre)}
    >
      {label}
    </button>
  );

  return (
    <div className="genre-filter">
      <span className="genre-label">
        <TagIcon size={16} /> Gênero
      </span>
      {chip('Todos', null)}
      {GENRES.map((g) => chip(g, g))}
    </div>
  );
}
