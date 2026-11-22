import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthCard } from './AuthLayout';
import { CheckCircleIcon } from './icons';

// Conteúdo central dos estados do cartão: ícone, título, texto e ações.
export function StatusPanel({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <AuthCard title="Criar conta">
      <div className="status-panel">
        {icon}
        <h2>{title}</h2>
        {text && <p className="status-text">{text}</p>}
        {children}
      </div>
    </AuthCard>
  );
}

// Fim do fluxo, tanto pelo código quanto pelo link do e-mail.
export function AccountConfirmed() {
  return (
    <StatusPanel
      icon={<CheckCircleIcon />}
      title="Conta confirmada!"
      text={
        <>
          Seu e-mail foi verificado.
          <br />
          Agora é só entrar na sua conta.
        </>
      }
    >
      <Link href="/" className="btn-primary">
        Ir para o login
      </Link>
    </StatusPanel>
  );
}
