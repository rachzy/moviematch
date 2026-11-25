'use client';

import { useDialog } from './useDialog';
import './ratings.css';

type Props = {
  open: boolean;
  deleting?: boolean;
  error?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

// Confirmação de exclusão avisando do impacto nos matches (SCRUM-74).
export function DeleteRatingModal({
  open,
  deleting,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const ref = useDialog(open);
  return (
    <dialog
      ref={ref}
      className="modal rating-modal"
      aria-labelledby="delete-rating-title"
      aria-describedby="delete-rating-desc"
      onCancel={(e) => {
        e.preventDefault();
        if (!deleting) onCancel();
      }}
    >
      <h2 id="delete-rating-title">Excluir avaliação?</h2>
      <p id="delete-rating-desc">
        Sua nota e seu comentário serão apagados. Seus matches serão
        recalculados sem este filme e podem mudar.
      </p>
      {error && (
        <p className="rating-error" role="alert">
          Não foi possível excluir. Tente novamente.
        </p>
      )}
      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={deleting}
          autoFocus
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onConfirm}
          disabled={deleting}
        >
          {deleting ? 'Excluindo…' : 'Excluir'}
        </button>
      </div>
    </dialog>
  );
}
