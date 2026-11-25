'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMovie } from '../api';
import type { MovieDetails as Details } from '../types';
import { ChevronLeftIcon, FilmIcon, StarIcon } from './icons';
import './movies.css';

type State =
  | { status: 'loading' }
  | { status: 'error'; notFound: boolean }
  | { status: 'done'; movie: Details };

const duration = (min: number) =>
  `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}min`;

// "A, B e C"
const list = (names: string[]) =>
  names.length < 2
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;

// `children` aparece abaixo da sinopse (a página põe a avaliação ali).
export function MovieDetails({
  movieId,
  children,
}: {
  movieId: number;
  children?: ReactNode;
}) {
  const router = useRouter();
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

  // Volta para a busca de onde a pessoa veio; sem histórico, abre a busca.
  const back = (
    <button
      type="button"
      className="back-link"
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push('/search')
      }
    >
      <ChevronLeftIcon size={16} /> Voltar aos resultados
    </button>
  );

  if (state.status === 'error') {
    return (
      <div className="movie-page">
        {back}
        <div className="empty-state" role="alert">
          <h2>
            {state.notFound
              ? 'Filme não encontrado'
              : 'Não foi possível carregar o filme'}
          </h2>
          {state.notFound ? (
            <Link href="/search" className="btn btn-secondary">
              Ir para a busca
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
      </div>
    );
  }

  const movie = state.status === 'done' ? state.movie : null;
  const meta = movie
    ? [movie.year, movie.genres[0], movie.runtime && duration(movie.runtime)]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <div className="movie-page">
      {back}
      <article className="movie-details" aria-busy={!movie}>
        <div className={movie ? 'movie-poster' : 'movie-poster skeleton'}>
          {movie?.posterUrl ? (
            <img src={movie.posterUrl} alt={`Pôster de ${movie.title}`} />
          ) : (
            movie && <FilmIcon size={48} />
          )}
        </div>
        <div className="movie-details-body">
          {movie ? (
            <>
              <h1>{movie.title}</h1>
              {meta && <p className="movie-meta">{meta}</p>}
              {movie.rating !== null && (
                <p className="movie-score">
                  <StarIcon size={16} />
                  <b>{movie.rating.toFixed(1).replace('.', ',')}</b> média de{' '}
                  {movie.voteCount.toLocaleString('pt-BR')} avaliações
                </p>
              )}
              {movie.cast.length > 0 && (
                <p className="movie-cast">
                  <span>Elenco:</span> {list(movie.cast.slice(0, 3))}
                </p>
              )}
              <p>{movie.overview || 'Sinopse não disponível.'}</p>
            </>
          ) : (
            <div className="skeleton">
              <span className="skeleton-line" />
              <span className="skeleton-line short" />
            </div>
          )}
          {children}
        </div>
      </article>
    </div>
  );
}
