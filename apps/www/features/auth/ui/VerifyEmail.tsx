'use client';

import Link from 'next/link';
import { useState } from 'react';
import { verifyEmail } from '../api';

// A confirmação só acontece no clique: scanners de link e prefetch de e-mail
// não consomem o token.
export function VerifyEmail({ token }: { token?: string }) {
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function onConfirm() {
    try {
      const { message } = await verifyEmail(token!);
      setResult({ ok: true, text: message });
    } catch {
      setResult({ ok: false, text: 'Token inválido ou expirado.' });
    }
  }

  return (
    <div className="auth">
      <h1>
        Movie<span>Match</span>
      </h1>
      {token ? (
        <button type="button" onClick={onConfirm} disabled={result?.ok}>
          Confirmar e-mail
        </button>
      ) : (
        <p className="error">Link de verificação inválido.</p>
      )}
      {result && <p className={result.ok ? 'ok' : 'error'}>{result.text}</p>}
      <p>
        <Link href="/">Ir para o login</Link>
      </p>
    </div>
  );
}
