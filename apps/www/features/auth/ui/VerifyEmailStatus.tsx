'use client';

import axios from 'axios';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { verifyEmail } from '../api';
import { MailIcon, WarningIcon } from './icons';
import { AccountConfirmed, StatusPanel } from './StatusPanel';

type Status = 'loading' | 'success' | 'invalid' | 'unavailable';

export function VerifyEmailStatus({ token }: { token?: string }) {
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'invalid');
  const started = useRef(false); // evita enviar o token 2x no modo dev

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        // 4xx = token inválido/expirado; rede ou 5xx = pode tentar de novo
        const code = axios.isAxiosError(err) ? err.response?.status : undefined;
        setStatus(code && code < 500 ? 'invalid' : 'unavailable');
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <StatusPanel
        icon={<MailIcon />}
        title="Confirmando seu e-mail..."
        text="Só um instante."
      />
    );
  }

  if (status === 'success') return <AccountConfirmed />;

  if (status === 'unavailable') {
    return (
      <StatusPanel
        icon={<WarningIcon />}
        title="Não foi possível confirmar"
        text="Houve um problema de conexão. Recarregue a página para tentar de novo."
      />
    );
  }

  return (
    <StatusPanel
      icon={<WarningIcon />}
      title="Link inválido ou expirado"
      text="Não foi possível confirmar seu e-mail."
    >
      <Link href="/register/verify" className="btn-primary">
        Reenviar e-mail de confirmação
      </Link>
      <p className="card-footer">
        Voltar para o <Link href="/">login</Link>
      </p>
    </StatusPanel>
  );
}
