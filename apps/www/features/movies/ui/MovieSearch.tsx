'use client';

import { useRef, useState } from 'react';
import { searchMovies } from '../api';
import type { Movie, SearchMode } from '../types';
import { GenreFilter } from './GenreFilter';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import './movies.css';

type Status = 'idle' | 'loading' | 'done' | 'error';

export function MovieSearch() {
  const [mode, setMode] = useState<SearchMode>('movie');
  const [text, setText] = useState('');
  const [genre, setGenre] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [movies, setMovies] = useState<Movie[]>([]);
  // Termo (e modo) da última busca disparada; o banner usa isto, não o input.
  const [searched, setSearched] = useState({ term: '', mode });
  const controller = useRef<AbortController>(null);

  async function run(term: string, g: string | null) {
    controller.current?.abort();
    term = term.trim();
    setSearched({ term, mode });

    if (!term && !g) {
      setMovies([]);
      setStatus('idle');
      return;
    }

    const ctrl = (controller.current = new AbortController());
    setStatus('loading');
    try {
      const results = await searchMovies(
        { q: term || undefined, genre: g ?? undefined },
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;
      setMovies(results);
      setStatus('done');
    } catch {
      if (!ctrl.signal.aborted) setStatus('error');
    }
  }

  function chooseGenre(g: string | null) {
    setGenre(g);
    void run(searched.term, g);
  }

  function clearAll() {
    controller.current?.abort();
    setText('');
    setGenre(null);
    setSearched({ term: '', mode });
    setMovies([]);
    setStatus('idle');
  }

  return (
    <div className="movie-search">
      <h1>Buscar filmes</h1>
      <p className="movie-search-sub">
        Busque pelo nome do filme ou do ator e filtre por gênero.
      </p>

      <SearchBar
        mode={mode}
        value={text}
        loading={status === 'loading'}
        onModeChange={setMode}
        onChange={setText}
        onSubmit={() => run(text, genre)}
      />

      <div className="filters-toolbar">
        <GenreFilter value={genre} onChange={chooseGenre} />
      </div>

      {(searched.term || genre) && (
        <div className="active-filters-bar">
          <span className="active-filters-summary">
            Filtros ativos:
            {searched.term && (
              <strong>
                {' '}
                {searched.mode === 'actor' ? 'Ator' : 'Filme'}: &quot;
                {searched.term}&quot;
              </strong>
            )}
            {genre && <strong> • Gênero: {genre}</strong>}
          </span>
          <button
            type="button"
            className="clear-filters-btn"
            onClick={clearAll}
          >
            Limpar filtros
          </button>
        </div>
      )}

      <SearchResults
        status={status}
        movies={movies}
        query={searched.term}
        onClear={clearAll}
      />
    </div>
  );
}
