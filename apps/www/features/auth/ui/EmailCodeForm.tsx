'use client';

import axios from 'axios';
import Link from 'next/link';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { AuthCard } from './AuthLayout';
import { MailIcon, WarningIcon } from './icons';
import { AccountConfirmed, StatusPanel } from './StatusPanel';
import './email-code.css';

const LENGTH = 6;
const COOLDOWN = 60; // segundos entre reenvios

type Props = {
  email?: string;
  // Devem rejeitar em caso de erro.
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
};

export function EmailCodeForm({ email, onConfirm, onResend }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [view, setView] = useState<'code' | 'blocked' | 'done'>('code');
  const errorId = useId();
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const refocus = useRef(false); // refoca o 1º campo quando sair do loading

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!loading && refocus.current) {
      refocus.current = false;
      focusAt(0);
    }
  }, [loading]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function focusAt(index: number) {
    refs.current[Math.min(Math.max(index, 0), LENGTH - 1)]?.focus();
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    setError('');
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit) focusAt(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
      focusAt(index - 1);
    } else if (e.key === 'ArrowLeft') {
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight') {
      focusAt(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, LENGTH);
    if (!pasted) return;
    setError('');
    setDigits(Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? ''));
    focusAt(pasted.length);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = digits.join('');

    if (code.length < LENGTH) {
      setError('Digite os 6 dígitos do código.');
      focusAt(digits.findIndex((d) => !d));
      return;
    }

    setLoading(true);
    setNotice('');
    try {
      await onConfirm(code);
      setView('done');
    } catch (err) {
      const res = axios.isAxiosError(err) ? err.response : undefined;
      if (res?.data?.message?.startsWith('Muitas tentativas')) {
        setView('blocked'); // a API bloqueou o código: só um novo resolve
      }
      setError(
        res?.status === 400
          ? res.data?.message || 'Código incorreto ou expirado.'
          : 'Não foi possível verificar agora. Tente novamente.',
      );
      setDigits(Array(LENGTH).fill(''));
      refocus.current = true;
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setNotice('');
    try {
      await onResend();
      // resposta genérica: a API não revela se o e-mail existe
      setNotice('Se o e-mail existir, enviamos um novo código.');
      setCooldown(COOLDOWN);
      setDigits(Array(LENGTH).fill(''));
      setView('code');
    } catch {
      setError('Não foi possível reenviar agora. Tente novamente.');
    }
  }

  if (view === 'done') return <AccountConfirmed />;

  if (view === 'blocked') {
    return (
      <StatusPanel
        icon={<WarningIcon />}
        title="Muitas tentativas"
        text={
          <>
            Por segurança, este código foi bloqueado.
            <br />
            Solicite um novo código para continuar.
          </>
        }
      >
        <button type="button" className="btn-primary" onClick={handleResend}>
          Enviar novo código
        </button>
        <p className="card-footer">
          Voltar para o <Link href="/register">cadastro</Link>
        </p>
      </StatusPanel>
    );
  }

  return (
    <AuthCard title="Criar conta">
      <div className="status-panel">
        <MailIcon />
        <h2>Confirme seu e-mail</h2>
        <p className="status-text">
          Enviamos um código de 6 dígitos para
          <br />
          {email ? <strong>{email}</strong> : 'o seu e-mail'}
        </p>

        <form className="ec-form" onSubmit={handleSubmit} noValidate>
          <div className="ec-boxes">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="ec-box"
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                aria-label={`Dígito ${i + 1} de ${LENGTH}`}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                value={digit}
                disabled={loading}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          <p id={errorId} className="field-error ec-error" role="alert">
            {error}
          </p>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="btn-spinner" aria-hidden="true" />}
            {loading ? 'Verificando…' : 'Confirmar'}
          </button>
        </form>

        <p className="card-footer">
          Não recebeu?{' '}
          <button
            type="button"
            className="btn-link"
            onClick={handleResend}
            disabled={loading || cooldown > 0}
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar código'}
          </button>
        </p>
        <p className="ec-status" role="status" aria-live="polite">
          {notice}
        </p>
        {!loading && (
          <p className="card-footer">
            E-mail errado? <Link href="/register">Voltar ao cadastro</Link>
          </p>
        )}
      </div>
    </AuthCard>
  );
}
