'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { POST_LOGIN_PATH } from '../routes';
import { useAuth } from './AuthContext';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function LoginForm() {
  const { login, token, ready } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && token) router.replace(POST_LOGIN_PATH);
  }, [ready, token, router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    if (!email || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    if (!EMAIL_RE.test(email)) {
      setError('Informe um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password); // o useEffect acima redireciona ao salvar o token
    } catch (err) {
      const res = isAxiosError(err) ? err.response : undefined;
      const apiMessage = res?.data?.message;
      const isClientError = res && res.status >= 400 && res.status < 500;
      setError(
        isClientError && typeof apiMessage === 'string'
          ? apiMessage // ex.: 403 "e-mail não verificado"
          : res?.status === 401
            ? 'E-mail ou senha incorretos.'
            : 'Não foi possível entrar agora. Tente novamente em instantes.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={onSubmit} noValidate>
      <h2>Entrar na sua conta</h2>

      <div className="field-group">
        <label htmlFor="email" className="field-label">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="ana@email.com"
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? 'login-error' : undefined}
          className={`text-input ${error ? 'input-error' : ''}`}
        />
      </div>

      <div className="field-group">
        <label htmlFor="password" className="field-label">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!error}
          aria-describedby={error ? 'login-error' : undefined}
          className={`text-input ${error ? 'input-error' : ''}`}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Entrando…' : 'Entrar'}
      </button>

      {error && (
        <div id="login-error" className="error-banner" role="alert">
          {error}
        </div>
      )}

      <p className="card-footer">
        Não tem conta? <Link href="/register">Cadastre-se</Link>
      </p>
    </form>
  );
}
