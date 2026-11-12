'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { resendVerification, verifyCode } from '../api';
import {
  clearPendingEmail,
  readPendingEmail,
  savePendingEmail,
} from '../pendingEmail';
import { EmailCodeForm } from './EmailCodeForm';

export function VerifyCode() {
  const router = useRouter();
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
      <form className="auth" onSubmit={onSubmit}>
        <h1>Confirme seu e-mail</h1>
        <p className="muted">Informe o e-mail usado no cadastro.</p>
        <input
          name="email"
          type="email"
          placeholder="seu@email.com"
          aria-label="E-mail"
          autoFocus
          required
        />
        <button type="submit">Continuar</button>
        <Link href="/register">Voltar ao cadastro</Link>
      </form>
    );
  }

  return (
    <EmailCodeForm
      email={email}
      onConfirm={async (code) => {
        await verifyCode(email, code);
        clearPendingEmail();
        router.push('/?verified=1');
      }}
      onResend={async () => {
        await resendVerification(email);
      }}
    />
  );
}
