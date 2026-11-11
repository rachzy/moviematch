'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import { LogoutModal } from './LogoutModal';

export function LogoutButton() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(true)}
      >
        Sair
      </button>
      <LogoutModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}
