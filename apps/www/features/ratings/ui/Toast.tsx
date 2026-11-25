'use client';

import { useEffect } from 'react';

export type ToastData = { ok: boolean; title: string; text: string };

// Aviso no canto da tela; some sozinho depois de 4 segundos.
export function Toast({
  toast,
  onClose,
}: {
  toast: ToastData | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div
      className={toast.ok ? 'rating-toast ok' : 'rating-toast error'}
      role={toast.ok ? 'status' : 'alert'}
    >
      <span className="rating-toast-icon" aria-hidden="true">
        {toast.ok ? '✓' : '!'}
      </span>
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.text}</p>
      </div>
      <button type="button" aria-label="Fechar mensagem" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
