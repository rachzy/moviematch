'use client';

import { useEffect, useState } from 'react';
import { RATING_LABELS, type Rating } from '../types';
import { StarRating } from './StarRating';
import { useDialog } from './useDialog';
import './ratings.css';

type Props = {
  open: boolean;
  rating: Rating;
  saving?: boolean;
  error?: boolean;
  onCancel: () => void;
  onSave: (value: number, comment: string) => void;
};

// Formulário de edição já preenchido com a nota e o comentário atuais (SCRUM-73).
export function EditRatingModal({
  open,
  rating,
  saving,
  error,
  onCancel,
  onSave,
}: Props) {
  const ref = useDialog(open);
  const [value, setValue] = useState(rating.value);
  const [comment, setComment] = useState(rating.comment ?? '');

  // Toda vez que abre, recomeça dos dados salvos.
  useEffect(() => {
    if (open) {
      setValue(rating.value);
      setComment(rating.comment ?? '');
    }
  }, [open, rating]);

  const unchanged =
    value === rating.value && comment.trim() === (rating.comment ?? '');

  return (
    <dialog
      ref={ref}
      className="modal rating-modal"
      aria-labelledby="edit-rating-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!saving) onCancel();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(value, comment);
        }}
      >
        <h2 id="edit-rating-title">Editar avaliação</h2>
        <p className="rating-before">
          Antes: {rating.value} · {RATING_LABELS[rating.value]}
        </p>
        <div className="rating-row">
          <StarRating
            value={value}
            onChange={setValue}
            disabled={saving}
            label="Nova nota"
          />
          <span className="rating-label">
            <b>{value}</b> · {RATING_LABELS[value]}
          </span>
        </div>
        <label className="rating-comment">
          Comentário (opcional)
          <textarea
            value={comment}
            maxLength={500}
            rows={3}
            disabled={saving}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>
        {error && (
          <p className="rating-error" role="alert">
            Não foi possível salvar a alteração. Tente novamente.
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || unchanged}
          >
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
