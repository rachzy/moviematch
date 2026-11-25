'use client';

import { useCallback, useEffect, useState } from 'react';
import { getMyRating, saveRating } from '../api';
import { RATING_LABELS } from '../types';
import { CommentField } from './CommentField';
import { CloseIcon } from './icons';
import { StarRating } from './StarRating';
import { Toast, type ToastData } from './Toast';
import { useDialog } from './useDialog';
import './ratings.css';

// O mínimo do filme que a janela precisa (vem do cartão da busca).
export type RatableMovie = {
  id: number;
  title: string;
  year: number | null;
  genre: string | null;
  posterUrl: string | null;
};

type Props = { movie: RatableMovie | null; onClose: () => void };

// Avaliar direto do resultado da busca, sem sair da tela (design A7).
export function RateMovieModal({ movie, onClose }: Props) {
  const ref = useDialog(!!movie);
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState('');
  const [already, setAlready] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  // Ao abrir, começa vazio ou com a avaliação que a pessoa já tinha feito.
  useEffect(() => {
    if (!movie) return;
    setValue(0);
    setComment('');
    setAlready(false);
    setError(false);
    getMyRating(movie.id)
      .then((r) => {
        if (!r) return;
        setAlready(true);
        setValue(r.value);
        setComment(r.comment ?? '');
      })
      .catch(() => {});
  }, [movie]);

  async function submit() {
    if (!movie || !value) return;
    setSending(true);
    setError(false);
    try {
      await saveRating(movie.id, value, comment);
      onClose();
      setToast({
        ok: true,
        title: 'Avaliação salva!',
        text: 'Sua nota e seu comentário já contam para seus matches.',
      });
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  const info = movie
    ? [movie.year, movie.genre].filter(Boolean).join(' · ')
    : '';

  return (
    <>
      <dialog
        ref={ref}
        className="modal rating-modal rate-modal"
        aria-labelledby="rate-title"
        onCancel={(e) => {
          e.preventDefault();
          if (!sending) onClose();
        }}
      >
        {movie && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <header className="rate-head">
              <h2 id="rate-title">
                {already ? 'Editar avaliação' : 'Avaliar filme'}
              </h2>
              <button
                type="button"
                className="rate-close"
                aria-label="Fechar"
                onClick={onClose}
                disabled={sending}
              >
                <CloseIcon />
              </button>
            </header>
            <div className="rate-movie">
              <div className="rate-poster">
                {movie.posterUrl && <img src={movie.posterUrl} alt="" />}
              </div>
              <div>
                <strong>{movie.title}</strong>
                {info && <span>{info}</span>}
              </div>
            </div>
            <div className="rate-stars">
              <StarRating
                value={value}
                onChange={setValue}
                disabled={sending}
              />
              <span className="rating-label">
                {value ? (
                  <>
                    <b>{value}</b> · {RATING_LABELS[value]}
                  </>
                ) : (
                  'Escolha uma nota'
                )}
              </span>
            </div>
            <CommentField
              value={comment}
              onChange={setComment}
              disabled={sending}
            />
            <p className="rating-hint">
              {already
                ? 'Você já avaliou este filme. Ao enviar, sua avaliação é atualizada.'
                : 'Cada filme só pode ser avaliado uma vez.'}
            </p>
            {error && (
              <p className="rating-error" role="alert">
                Não foi possível salvar sua avaliação. Tente novamente.
              </p>
            )}
            <div className="rate-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={sending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rating-btn"
                disabled={!value || sending}
              >
                {sending ? 'Enviando…' : 'Enviar avaliação'}
              </button>
            </div>
          </form>
        )}
      </dialog>
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
