'use client';

import { useEffect, useState } from 'react';
import { deleteRating, getMyRating, saveRating } from '../api';
import { RATING_LABELS, type Rating } from '../types';
import { DeleteRatingModal } from './DeleteRatingModal';
import { EditRatingModal } from './EditRatingModal';
import { StarRating } from './StarRating';
import './ratings.css';

type Toast = { ok: boolean; title: string; text: string } | null;
type Modal = 'edit' | 'delete' | null;

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function MovieRating({ movieId }: { movieId: number }) {
  const [saved, setSaved] = useState<Rating | null>(null);
  const [draft, setDraft] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [toast, setToast] = useState<Toast>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState(false);

  // Falha no GET NÃO é "sem avaliação": mostra erro com retry em vez do formulário.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getMyRating(movieId)
      .then((rating) => !cancelled && setSaved(rating))
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [movieId, attempt]);

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
      setSaved(await saveRating(movieId, draft, comment));
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

  function openModal(m: Modal) {
    setModalError(false);
    setModal(m);
  }

  async function onEdit(value: number, newComment: string) {
    setModalBusy(true);
    setModalError(false);
    try {
      setSaved(await saveRating(movieId, value, newComment));
      setModal(null);
      setToast({
        ok: true,
        title: 'Avaliação atualizada!',
        text: 'Seus matches já foram recalculados com a nova nota.',
      });
    } catch {
      setModalError(true);
    } finally {
      setModalBusy(false);
    }
  }

  async function onDelete() {
    setModalBusy(true);
    setModalError(false);
    try {
      await deleteRating(movieId);
      setSaved(null);
      setDraft(0);
      setComment('');
      setModal(null);
      setToast({
        ok: true,
        title: 'Avaliação excluída',
        text: 'Este filme não conta mais para seus matches.',
      });
    } catch {
      setModalError(true);
    } finally {
      setModalBusy(false);
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
          ? 'Confira a nota antes de enviar. Depois você pode editar ou excluir.'
          : 'Escolha de 1 a 5 estrelas. Depois você pode editar ou excluir.';

  return (
    <>
      <section
        id="avaliacao"
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
            disabled={loading || sending || loadError}
            readOnly={!!saved}
          />
          <span className="rating-label">
            {choice ? (
              <>
                <b>{choice}</b> · {RATING_LABELS[choice]}
              </>
            ) : (
              'Escolha uma nota'
            )}
          </span>
        </div>

        {loadError && (
          <>
            <p className="rating-error" role="alert">
              Não foi possível carregar sua avaliação.
            </p>
            <button
              type="button"
              className="rating-btn"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Tentar novamente
            </button>
          </>
        )}

        {failed && (
          <p className="rating-error">
            Não foi possível salvar sua avaliação. Verifique sua conexão e tente
            novamente.
          </p>
        )}

        {saved && (
          <>
            {saved.comment && <p className="rating-quote">{saved.comment}</p>}
            <div className="rating-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => openModal('edit')}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => openModal('delete')}
              >
                Excluir
              </button>
            </div>
          </>
        )}

        {!saved && !loadError && (
          <>
            <label className="rating-comment">
              Comentário (opcional)
              <textarea
                value={comment}
                maxLength={500}
                rows={3}
                placeholder="O que você achou do filme?"
                disabled={loading || sending}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
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

      {saved && (
        <EditRatingModal
          open={modal === 'edit'}
          rating={saved}
          saving={modalBusy}
          error={modalError}
          onCancel={() => setModal(null)}
          onSave={onEdit}
        />
      )}
      <DeleteRatingModal
        open={modal === 'delete'}
        deleting={modalBusy}
        error={modalError}
        onCancel={() => setModal(null)}
        onConfirm={onDelete}
      />

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
