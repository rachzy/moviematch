'use client';

import { useCallback, useEffect, useState } from 'react';
import { deleteRating, getMyRating, saveRating } from '../api';
import { RATING_LABELS, type Rating } from '../types';
import { CommentField } from './CommentField';
import { DeleteRatingModal } from './DeleteRatingModal';
import { EditRatingModal } from './EditRatingModal';
import { InfoIcon, PencilIcon, TrashIcon } from './icons';
import { StarRating } from './StarRating';
import { Toast, type ToastData } from './Toast';
import './ratings.css';

type Modal = 'edit' | 'delete' | null;

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export function MovieRating({ movieId }: { movieId: number }) {
  const [saved, setSaved] = useState<Rating | null>(null);
  // true quando a avaliação já existia ao abrir a página (aviso "Você já avaliou").
  const [ratedBefore, setRatedBefore] = useState(false);
  const [draft, setDraft] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);

  // Falha no GET NÃO é "sem avaliação": mostra erro com retry em vez do formulário.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getMyRating(movieId)
      .then((rating) => {
        if (cancelled) return;
        setSaved(rating);
        setRatedBefore(!!rating);
      })
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [movieId, attempt]);

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
        text: 'Sua nota e seu comentário já contam para seus matches.',
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
      setRatedBefore(false);
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
        ? 'Sua nota e seu comentário não foram perdidos. Tente enviar de novo.'
        : draft
          ? 'Confira a nota e o comentário antes de enviar. Cada filme só pode ser avaliado uma vez.'
          : 'Escolha de 1 a 5 estrelas. Cada filme só pode ser avaliado uma vez.';

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
          <div className="rating-foot">
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
          </div>
        )}

        {saved && (
          <>
            {saved.comment && <p className="rating-quote">{saved.comment}</p>}
            <div className="rating-foot">
              <span />
              <div className="rating-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openModal('edit')}
                >
                  <PencilIcon /> Editar
                </button>
                <button
                  type="button"
                  className="btn btn-danger-outline"
                  onClick={() => openModal('delete')}
                >
                  <TrashIcon /> Excluir
                </button>
              </div>
            </div>
          </>
        )}

        {!saved && !loadError && (
          <>
            <CommentField
              value={comment}
              onChange={setComment}
              disabled={loading || sending}
            />
            <div className="rating-foot">
              {failed ? (
                <p className="rating-error" role="alert">
                  Não foi possível salvar sua avaliação. Verifique sua conexão e
                  tente novamente.
                </p>
              ) : sending || loading ? (
                <span />
              ) : draft ? (
                <p className="rating-hint">
                  Você pode enviar só a nota, sem comentário.
                </p>
              ) : (
                <p className="rating-hint">
                  <InfoIcon /> Escolha uma nota para liberar o botão.
                </p>
              )}
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
            </div>
          </>
        )}
      </section>

      {saved && ratedBefore && (
        <p className="rating-notice">
          <InfoIcon /> Você já avaliou este filme. Para mudar a nota ou o
          comentário, use Editar.
        </p>
      )}

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

      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
