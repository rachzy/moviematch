import type { SearchBy } from '../types';
import { FilmIcon, UserIcon } from './icons';

type Props = { value: SearchBy; onChange: (by: SearchBy) => void };

// Escolhe se o texto da busca é o nome do filme ou do ator.
export function SearchModeToggle({ value, onChange }: Props) {
  const option = (by: SearchBy, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      aria-pressed={value === by}
      onClick={() => onChange(by)}
    >
      {icon}
      {label}
    </button>
  );
  return (
    <div className="search-mode" role="group" aria-label="Buscar por">
      {option('title', 'Filme', <FilmIcon size={16} />)}
      {option('actor', 'Ator', <UserIcon size={16} />)}
    </div>
  );
}
