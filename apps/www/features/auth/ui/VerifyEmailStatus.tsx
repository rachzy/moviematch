'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { verifyEmail } from '../api';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailStatus({ token }: { token?: string }) {
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
  const started = useRef(false); // evita enviar o token 2x no modo dev

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="auth">
        <h1>Confirmando seu e-mail...</h1>
        <p className="muted">Só um instante.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="auth">
        <h1>E-mail confirmado!</h1>
        <p className="muted">Sua conta foi ativada com sucesso.</p>
        <Link href="/" className="button">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth">
      <h1>Link inválido ou expirado</h1>
      <p className="muted">Não foi possível confirmar seu e-mail.</p>
      <Link href="/register" className="button">
        Voltar ao cadastro
      </Link>
    </div>
  );
}
