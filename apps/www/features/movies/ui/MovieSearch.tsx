'use client';

import { useMemo, useState } from 'react';
import { searchMovies } from '../api';
import { STUDIOS } from '../studios';
import type { Movie, SearchMode } from '../types';
import { GenreFilter } from './GenreFilter';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { StudioFilter } from './StudioFilter';
import './movies.css';

type Status = 'idle' | 'loading' | 'done' | 'error';

export function MovieSearch() {
  const [mode, setMode] = useState<SearchMode>('movie');
  const [text, setText] = useState('');
  const [genre, setGenre] = useState<string | null>(null);
  const [studio, setStudio] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searched, setSearched] = useState('');

  async function run(
    nextMode: SearchMode,
    q: string,
    g: string | null,
    s: string | null,
  ) {
    const term = q.trim();
    setSearched(term);

    if (!term && !g && !s) {
      setMovies([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    try {
      const results = await searchMovies({
        q: nextMode === 'movie' && term ? term : undefined,
        actor: nextMode === 'actor' && term ? term : undefined,
        genre: g ?? undefined,
        studio: s ?? undefined,
      });

      const filtered = results.filter((movie) => {
        if (s && movie.studio && movie.studio.toLowerCase() !== s.toLowerCase()) {
          return false;
        }
        if (
          nextMode === 'actor' &&
          term &&
          Array.isArray(movie.actors) &&
          !movie.actors.some((actor) =>
            actor.toLowerCase().includes(term.toLowerCase()),
          )
        ) {
          return false;
        }
        return true;
      });

      setMovies(filtered);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  function handleModeChange(nextMode: SearchMode) {
    setMode(nextMode);
    if (text.trim() || genre || studio) {
      void run(nextMode, text, genre, studio);
    }
  }

  function chooseGenre(g: string | null) {
    setGenre(g);
    void run(mode, text, g, studio);
  }

  function chooseStudio(s: string | null) {
    setStudio(s);
    void run(mode, text, genre, s);
  }

  function clearAll() {
    setText('');
    setGenre(null);
    setStudio(null);
    setSearched('');
    setMovies([]);
    setStatus('idle');
  }

  const availableStudios = useMemo(() => {
    const dynamic = movies
      .map((m) => m.studio)
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set([...STUDIOS, ...dynamic]));
  }, [movies]);

  const hasActiveFilters = Boolean(text.trim() || genre || studio);

  return (
    <div className="movie-search">
      <h1>Buscar filmes</h1>
      <p className="movie-search-sub">
        Escolha se vai buscar pelo nome do filme ou do ator e filtre por gênero ou estúdio.
      </p>

      <SearchBar
        mode={mode}
        value={text}
        loading={status === 'loading'}
        onModeChange={handleModeChange}
        onChange={setText}
        onSubmit={() => run(mode, text, genre, studio)}
      />

      <div className="filters-toolbar">
        <GenreFilter value={genre} onChange={chooseGenre} />
        <div className="filters-divider" aria-hidden="true" />
        <StudioFilter
          value={studio}
          studios={availableStudios}
          onChange={chooseStudio}
        />
      </div>
      
      {hasActiveFilters && (
        <div className="active-filters-bar">
          <span className="active-filters-summary">
            Filtros ativos:
            {text.trim() && (
              <strong>
                {' '}
                {mode === 'actor' ? `Ator: "${text.trim()}"` : `Filme: "${text.trim()}"`}
              </strong>
            )}
            {genre && <strong> • Gênero: {genre}</strong>}
            {studio && <strong> • Estúdio: {studio}</strong>}
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
        query={searched}
        onClear={clearAll}
      />
    </div>
  );
}