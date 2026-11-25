'use client';

import type { SearchMode } from '../types';
import { ActorIcon, CloseIcon, FilmIcon, SearchIcon } from './icons';

type Props = {
  mode: SearchMode;
  value: string;
  loading?: boolean;
  onModeChange: (mode: SearchMode) => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function SearchBar({
  mode,
  value,
  loading,
  onModeChange,
  onChange,
  onSubmit,
}: Props) {
  const placeholder =
    mode === 'actor'
      ? 'Digite o nome do ator ou atriz'
      : 'Digite o nome do filme';

  return (
    <form
      className="search-bar"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="search-mode-toggle" role="group" aria-label="Tipo de busca">
        <button
          type="button"
          className="search-mode-btn"
          aria-pressed={mode === 'movie'}
          onClick={() => onModeChange('movie')}
        >
          <FilmIcon size={16} />
          <span>Filme</span>
        </button>
        <button
          type="button"
          className="search-mode-btn"
          aria-pressed={mode === 'actor'}
          onClick={() => onModeChange('actor')}
        >
          <ActorIcon size={16} />
          <span>Ator</span>
        </button>
      </div>

      <label className="search-field">
        <SearchIcon />
        <span className="sr-only">
          {mode === 'actor' ? 'Buscar por ator ou atriz' : 'Buscar filmes'}
        </span>
        <input
          type="text"
          value={value}
          maxLength={100}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="search-clear"
            aria-label="Limpar busca"
            onClick={() => onChange('')}
          >
            <CloseIcon size={14} />
          </button>
        )}
      </label>

      <button type="submit" className="search-submit" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : <SearchIcon size={16} />}
        {loading ? 'Buscando…' : 'Buscar'}
      </button>
    </form>
  );
}