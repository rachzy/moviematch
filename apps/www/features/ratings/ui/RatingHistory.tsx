'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRatingHistory } from '../api';
import type { RatingHistoryItem } from '../types';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function renderStars(value: number) {
  return '★'.repeat(value) + '☆'.repeat(Math.max(0, 5 - value));
}

export function RatingHistory() {
  const [items, setItems] = useState<RatingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getRatingHistory()
      .then((data) => {
        if (!active) return;
        setItems(data);
      })
      .catch(() => {
        if (!active) return;
        setError('Não foi possível carregar o seu histórico.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p style={{ color: '#94a3b8' }}>Carregando histórico...</p>;
  }

  if (error) {
    return (
      <div
        style={{
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <p style={{ marginBottom: '0.5rem' }}>{error}</p>
        <Link href="/search" style={{ color: '#60a5fa' }}>
          Voltar para busca
        </Link>
      </div>
    );
  }

  return (
    <section style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>
        Histórico de avaliações e interações
      </h1>

      {items.length === 0 ? (
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <p style={{ color: '#94a3b8', marginBottom: '0.75rem' }}>
            Você ainda não registrou nenhuma avaliação.
          </p>
          <Link href="/search" style={{ color: '#60a5fa', fontWeight: 500 }}>
            Explorar filmes →
          </Link>
        </div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              {item.movie.posterUrl ? (
                <img
                  src={item.movie.posterUrl}
                  alt={item.movie.title}
                  width={48}
                  height={72}
                  style={{ borderRadius: '6px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: '48px',
                    height: '72px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  🎬
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <Link
                    href={`/movies/${item.movieId}`}
                    style={{
                      color: '#f8fafc',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                    }}
                  >
                    {item.movie.title}
                  </Link>
                  {item.movie.year ? (
                    <span style={{ color: '#94a3b8', marginLeft: '0.4rem' }}>
                      ({item.movie.year})
                    </span>
                  ) : null}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <span style={{ color: '#facc15', letterSpacing: '1px' }}>
                    {renderStars(item.value)}
                  </span>
                  <span style={{ color: '#cbd5e1' }}>{item.value}/5</span>
                </div>
              </div>

              <small
                style={{
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatDate(item.updatedAt)}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}