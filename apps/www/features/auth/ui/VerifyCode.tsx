'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { resendVerification, verifyCode } from '../api';
import {
  clearPendingEmail,
  readPendingEmail,
  savePendingEmail,
} from '../pendingEmail';
import { AuthCard } from './AuthLayout';
import { EmailCodeForm } from './EmailCodeForm';

export function VerifyCode() {
  const [email, setEmail] = useState<string | null>(null); // null = ainda lendo

  useEffect(() => setEmail(readPendingEmail()), []);

  if (email === null) return null;

  if (!email) {
    function onSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const value = String(new FormData(e.currentTarget).get('email')).trim();
      if (!value) return;
      savePendingEmail(value);
      setEmail(value);
    }

    return (
      <AuthCard title="Confirme seu e-mail">
        <form onSubmit={onSubmit}>
          <p className="status-text">Informe o e-mail usado no cadastro.</p>
          <div className="field-group">
            <input
              name="email"
              type="email"
              placeholder="E-mail"
              aria-label="E-mail"
              className="text-input"
              autoFocus
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Continuar
          </button>
        </form>
        <p className="card-footer">
          <Link href="/register">Voltar ao cadastro</Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <EmailCodeForm
      email={email}
      onConfirm={async (code) => {
        await verifyCode(email, code);
        clearPendingEmail();
      }}
      onResend={async () => {
        await resendVerification(email);
      }}
    />
  );
}
