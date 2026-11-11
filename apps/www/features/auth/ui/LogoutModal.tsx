'use client';

import { useEffect } from 'react';

type Props = { open: boolean; onCancel: () => void; onConfirm: () => void };

export function LogoutModal({ open, onCancel, onConfirm }: Props) {
  // Esc fecha o modal (acessibilidade).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
        onClick={(e) => e.stopPropagation()} // clicar dentro não fecha
      >
        <h2 id="logout-title">Deseja sair da sua conta?</h2>
        <p id="logout-desc">
          Você precisará entrar novamente para acessar suas avaliações.
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            autoFocus
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
