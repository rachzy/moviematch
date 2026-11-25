'use client';

import { useState } from 'react';
import { searchMovies } from '../api';
import type { Movie } from '../types';
import { GenreFilter } from './GenreFilter';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import './movies.css';

type Status = 'idle' | 'loading' | 'done' | 'error';

export function MovieSearch() {
  const [text, setText] = useState('');
  const [genre, setGenre] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searched, setSearched] = useState('');

  async function run(q: string, g: string | null) {
    const term = q.trim();
    setSearched(term);
    if (!term && !g) {
      setStatus('idle');
      return;
    }
    setStatus('loading');
    try {
      setMovies(
        await searchMovies({ q: term || undefined, genre: g ?? undefined }),
      );
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  function chooseGenre(g: string | null) {
    setGenre(g);
    void run(text, g);
  }

  function clear() {
    setText('');
    void run('', genre);
  }

  return (
    <div className="movie-search">
      <h1>Buscar filmes</h1>
      <p className="movie-search-sub">
        Busque pelo nome do filme ou do ator e filtre por gênero.
      </p>
      <SearchBar
        value={text}
        loading={status === 'loading'}
        onChange={setText}
        onSubmit={() => run(text, genre)}
      />
      <GenreFilter value={genre} onChange={chooseGenre} />
      <SearchResults
        status={status}
        movies={movies}
        query={searched}
        onClear={clear}
      />
    </div>
  );
}
