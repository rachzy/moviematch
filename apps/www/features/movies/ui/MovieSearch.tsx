'use client';

import { useCallback, useEffect, useState } from 'react';
import { searchMovies } from '../api';
import type { Movie, SearchBy } from '../types';
import { GenreFilter } from './GenreFilter';
import { SearchBar } from './SearchBar';
import { SearchModeToggle } from './SearchModeToggle';
import { SearchResults, type ResultsView } from './SearchResults';
import './movies.css';

type Status = 'loading' | 'done' | 'error';

// `onRate`: quem compõe a tela abre a janela de avaliação (app/(private)/search).
export function MovieSearch({ onRate }: { onRate?: (movie: Movie) => void }) {
  const [text, setText] = useState('');
  const [by, setBy] = useState<SearchBy>('title');
  const [genre, setGenre] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [view, setView] = useState<ResultsView>({ kind: 'popular' });

  // Sem texto nem gênero, a API devolve os filmes populares.
  const run = useCallback(async (q: string, b: SearchBy, g: string | null) => {
    const term = q.trim();
    setView(
      term || g
        ? { kind: 'search', query: term, by: b, genre: g }
        : { kind: 'popular' },
    );
    setStatus('loading');
    try {
      setMovies(
        await searchMovies({
          q: term || undefined,
          genre: g ?? undefined,
          by: term ? b : undefined,
        }),
      );
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void run('', 'title', null);
  }, [run]);

  function chooseBy(b: SearchBy) {
    setBy(b);
    if (text.trim()) void run(text, b, genre);
  }

  function chooseGenre(g: string | null) {
    setGenre(g);
    void run(text, by, g);
  }

  function clear() {
    setText('');
    void run('', by, genre);
  }

  function popular() {
    setText('');
    setGenre(null);
    void run('', by, null);
  }

  return (
    <div className="movie-search">
      {view.kind === 'popular' && (
        <header className="movie-search-head">
          <h1>Buscar filmes</h1>
          <p className="movie-search-sub">
            Escolha se vai buscar pelo nome do filme ou do ator, filtre por
            gênero e avalie o que assistiu.
          </p>
        </header>
      )}
      <div className="search-row">
        <SearchModeToggle value={by} onChange={chooseBy} />
        <SearchBar
          value={text}
          placeholder={
            by === 'actor' ? 'Digite o nome do ator' : 'Digite o nome do filme'
          }
          loading={status === 'loading' && view.kind === 'search'}
          onChange={setText}
          onSubmit={() => run(text, by, genre)}
        />
      </div>
      <GenreFilter value={genre} onChange={chooseGenre} />
      <SearchResults
        status={status}
        movies={movies}
        view={view}
        onClear={clear}
        onPopular={popular}
        onRate={onRate}
      />
    </div>
  );
}
