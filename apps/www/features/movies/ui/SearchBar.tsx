'use client';

import { CloseIcon, SearchIcon } from './icons';

type Props = {
  value: string;
  loading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function SearchBar({ value, loading, onChange, onSubmit }: Props) {
  return (
    <form
      className="search-bar"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="search-field">
        <SearchIcon />
        <span className="sr-only">Buscar filmes</span>
        <input
          type="text"
          value={value}
          maxLength={100}
          placeholder="Digite o nome do filme ou do ator"
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
