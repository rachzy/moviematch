'use client';

import { useEffect, useRef } from 'react';

type Props = { open: boolean; onCancel: () => void; onConfirm: () => void };

// <dialog> nativo: o navegador cuida do foco preso, do Esc e do backdrop.
export function LogoutModal({ open, onCancel, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="logout-title"
      aria-describedby="logout-desc"
      onCancel={(e) => {
        e.preventDefault(); // quem fecha é o estado `open` do pai
        onCancel();
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()} // clique no backdrop
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
    </dialog>
  );
}
