'use client';

import { useEffect, useState } from 'react';
import { getMyRating, saveRating } from '../api';
import type { Rating } from '../types';
import { StarRating } from './StarRating';

const LABELS = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

type Toast = { ok: boolean; title: string; text: string } | null;

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function MovieRating({ movieId }: { movieId: number }) {
  const [saved, setSaved] = useState<Rating | null>(null);
  const [draft, setDraft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    let cancelled = false;
    getMyRating(movieId)
      .then((rating) => !cancelled && setSaved(rating))
      .catch(
        () =>
          !cancelled &&
          setToast({
            ok: false,
            title: 'Não foi possível carregar',
            text: 'Verifique sua conexão e tente novamente.',
          }),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  // A mensagem some sozinha depois de 4 segundos.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function onChange(value: number) {
    setDraft(value);
    setFailed(false);
  }

  async function onSubmit() {
    if (!draft || sending) return;
    setSending(true);
    setFailed(false);
    try {
      setSaved(await saveRating(movieId, draft));
      setToast({
        ok: true,
        title: 'Avaliação salva!',
        text: 'Sua nota já conta para seus matches.',
      });
    } catch {
      setFailed(true);
      setToast({
        ok: false,
        title: 'Não foi possível salvar',
        text: 'Verifique sua conexão e tente novamente.',
      });
    } finally {
      setSending(false);
    }
  }

  const choice = saved ? saved.value : draft;

  const subtitle = sending
    ? 'Salvando sua nota…'
    : saved
      ? 'Sua nota já entra no cálculo de match com outras pessoas.'
      : failed
        ? 'Sua nota não foi perdida. Tente enviar de novo.'
        : draft
          ? 'Confira a nota antes de enviar. Cada filme só pode ser avaliado uma vez.'
          : 'Escolha de 1 a 5 estrelas. Cada filme só pode ser avaliado uma vez.';

  return (
    <>
      <section
        className={failed ? 'rating-card failed' : 'rating-card'}
        aria-busy={loading || sending}
      >
        <header className="rating-head">
          <h2>Sua avaliação</h2>
          {saved && (
            <span className="rating-badge">
              ✓ Avaliado em {formatDate(saved.createdAt)}
            </span>
          )}
        </header>
        <p className="rating-sub">{subtitle}</p>

        <div className="rating-row">
          <StarRating
            value={choice}
            onChange={onChange}
            disabled={loading || sending}
            readOnly={!!saved}
          />
          <span className="rating-label">
            {choice ? (
              <>
                <b>{choice}</b> · {LABELS[choice]}
              </>
            ) : (
              'Escolha uma nota'
            )}
          </span>
        </div>

        {failed && (
          <p className="rating-error" role="alert">
            Não foi possível salvar sua avaliação. Verifique sua conexão e tente
            novamente.
          </p>
        )}

        {!saved && (
          <>
            <button
              type="button"
              className="rating-btn"
              onClick={onSubmit}
              disabled={loading || sending || !draft}
            >
              {sending ? (
                <>
                  <span className="rating-spinner" /> Enviando…
                </>
              ) : failed ? (
                'Tentar novamente'
              ) : (
                'Enviar avaliação'
              )}
            </button>
            {!draft && !loading && (
              <p className="rating-hint">
                Escolha uma nota para liberar o botão.
              </p>
            )}
          </>
        )}
      </section>

      {toast && (
        <div
          className={toast.ok ? 'rating-toast ok' : 'rating-toast error'}
          role={toast.ok ? 'status' : 'alert'}
        >
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.text}</p>
          </div>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => setToast(null)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
