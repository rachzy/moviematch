'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMovie } from '../api';
import type { MovieDetails as Details } from '../types';
import { FilmIcon } from './icons';
import './movies.css';

type State =
  | { status: 'loading' }
  | { status: 'error'; notFound: boolean }
  | { status: 'done'; movie: Details };

export function MovieDetails({ movieId }: { movieId: number }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    getMovie(movieId)
      .then((movie) => !cancelled && setState({ status: 'done', movie }))
      .catch(
        (e) =>
          !cancelled &&
          setState({ status: 'error', notFound: e?.response?.status === 404 }),
      );
    return () => {
      cancelled = true;
    };
  }, [movieId, attempt]);

  if (state.status === 'loading') {
    return (
      <article className="movie-details skeleton" aria-busy="true">
        <div className="movie-poster" />
        <div className="movie-details-body">
          <span className="skeleton-line" />
          <span className="skeleton-line short" />
        </div>
      </article>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="empty-state" role="alert">
        <h2>
          {state.notFound
            ? 'Filme não encontrado'
            : 'Não foi possível carregar o filme'}
        </h2>
        {state.notFound ? (
          <Link href="/search" className="btn btn-secondary">
            Voltar para a busca
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  const { movie } = state;
  return (
    <article className="movie-details">
      <div className="movie-poster">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={`Pôster de ${movie.title}`} />
        ) : (
          <FilmIcon size={48} />
        )}
      </div>
      <div className="movie-details-body">
        <h1>
          {movie.title}
          {movie.year && <span> ({movie.year})</span>}
        </h1>
        {movie.genres.length > 0 && (
          <ul className="movie-tags" aria-label="Gêneros">
            {movie.genres.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        )}
        <p>{movie.overview || 'Sinopse não disponível.'}</p>
        {movie.cast.length > 0 && (
          <p className="movie-cast">
            <strong>Elenco:</strong> {movie.cast.join(', ')}
          </p>
        )}
      </div>
    </article>
  );
}
