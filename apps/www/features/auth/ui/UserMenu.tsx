'use client';

import { useEffect, useRef, useState } from 'react';
import { getMe } from '../api';
import type { User } from '../types';
import { useAuth } from './AuthContext';
import { LogoutModal } from './LogoutModal';

// "Ana Maria" → "AM"; "samuel" → "S".
function initials(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

// Avatar com as iniciais; ao clicar, mostra nome, e-mail e "Sair".
export function UserMenu() {
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) =>
      !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-avatar"
        aria-label="Menu da conta"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {user ? initials(user.username) : '…'}
      </button>
      {open && (
        <div className="user-dropdown" role="menu">
          {user && (
            <div className="user-info">
              <strong>{user.username}</strong>
              <span>{user.email}</span>
            </div>
          )}
          <button
            type="button"
            role="menuitem"
            className="user-logout"
            onClick={() => {
              setOpen(false);
              setConfirm(true);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sair
          </button>
        </div>
      )}
      <LogoutModal
        open={confirm}
        onCancel={() => setConfirm(false)}
        onConfirm={logout}
      />
    </div>
  );
}
