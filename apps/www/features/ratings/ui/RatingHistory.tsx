'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRatingHistory } from '../api';
import type { RatingHistoryItem } from '../types';
import { StarRating } from './StarRating';
import './history.css';

const noop = () => {};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

type ViewProps = {
  status: 'loading' | 'error' | 'done';
  items: RatingHistoryItem[];
};

export function HistoryView({ status, items }: ViewProps) {
  if (status === 'loading') {
    return <p className="history-empty">Carregando histórico...</p>;
  }
  if (status === 'error') {
    return (
      <p className="error-banner">Não foi possível carregar o seu histórico.</p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="history-empty">
        Você ainda não avaliou nenhum filme.{' '}
        <Link href="/search">Explorar filmes</Link>
      </p>
    );
  }

  return (
    <ul className="history-list">
      {items.map(({ movieId, value, updatedAt, movie }) => (
        <li key={movieId} className="history-item">
          <div className="history-poster">
            {movie?.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={`Pôster de ${movie.title}`}
                loading="lazy"
              />
            )}
          </div>
          <div className="history-info">
            <Link href={`/movies/${movieId}`}>
              {movie?.title ?? `Filme #${movieId}`}
            </Link>
            {movie?.year && <span>{movie.year}</span>}
            <StarRating
              value={Number.isInteger(value) ? value : 0}
              onChange={noop}
              readOnly
              label={`Nota ${value} de 5`}
            />
          </div>
          <small className="history-date">{formatDate(updatedAt)}</small>
        </li>
      ))}
    </ul>
  );
}

export function RatingHistory() {
  const [items, setItems] = useState<RatingHistoryItem[]>([]);
  const [status, setStatus] = useState<ViewProps['status']>('loading');

  useEffect(() => {
    getRatingHistory()
      .then((data) => {
        setItems(data);
        setStatus('done');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <section className="history">
      <h1>Histórico de avaliações</h1>
      <HistoryView status={status} items={items} />
    </section>
  );
}
