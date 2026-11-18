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
import './email-code.css';

const LENGTH = 6;
const COOLDOWN = 60; // segundos entre reenvios

type Props = {
  email?: string;
  // Devem rejeitar em caso de erro.
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
};

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="2" y="7" width="24" height="19" rx="4" fill="#60A5FA" />
      <rect x="2" y="2" width="24" height="6" rx="2" fill="#93C5FD" />
      <path d="M11 12.5v8l7-4z" fill="#fff" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      stroke="#2563EB"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="11" width="36" height="26" rx="5" />
      <path d="M8 15l16 12 16-12" />
    </svg>
  );
}

function Hero() {
  return (
    <aside className="ec-hero">
      <div className="ec-brand">
        <LogoIcon />
        <span>
          Movie<b>Match</b>
        </span>
      </div>

      <div className="ec-hero-text">
        <h2>Encontre quem tem o mesmo gosto para filmes.</h2>
        <p>
          Avalie o que você assistiu e conecte-se com pessoas de gosto parecido.
        </p>
      </div>

      <div className="ec-posters" aria-hidden="true">
        <span className="ec-poster ec-poster-blue" />
        <span className="ec-poster ec-poster-orange" />
        <span className="ec-poster ec-poster-teal" />
        <span className="ec-match">
          <span className="ec-check">✓</span>92% de match
        </span>
      </div>

      <div className="ec-ratings" aria-hidden="true">
        <span>
          <span className="ec-stars">★★★★☆</span>4,0 · você
        </span>
        <span>
          <span className="ec-stars">★★★★☆</span>4,5 · Lara
        </span>
      </div>

      <small>© 2026 MovieMatch</small>
    </aside>
  );
}

export function EmailCodeForm({ email, onConfirm, onResend }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cooldown, setCooldown] = useState(0);
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
    } catch (err) {
      const res = axios.isAxiosError(err) ? err.response : undefined;
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
    } catch {
      setError('Não foi possível reenviar agora. Tente novamente.');
    }
  }

  return (
    <div className="ec-page">
      <Hero />

      <section className="ec-panel">
        <div className="ec">
          <h1>Criar conta</h1>
          <MailIcon />
          <h2>Confirme seu e-mail</h2>
          <p className="ec-text">
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

            <p id={errorId} className="ec-error" role="alert">
              {error}
            </p>

            <button type="submit" className="ec-btn" disabled={loading}>
              {loading && <span className="ec-spinner" aria-hidden="true" />}
              {loading ? 'Verificando…' : 'Confirmar'}
            </button>
          </form>

          <p className="ec-foot">
            Não recebeu?{' '}
            <button
              type="button"
              className="ec-link"
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
            <p className="ec-foot">
              E-mail errado?{' '}
              <Link href="/register" className="ec-link">
                Voltar ao cadastro
              </Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
