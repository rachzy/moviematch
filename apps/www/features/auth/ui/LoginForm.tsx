'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useAuth } from './AuthContext';

export function LoginForm() {
  const { login, token, ready } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && token) router.replace('/home');
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

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (err) {
      const invalid = isAxiosError(err) && err.response?.status === 401;
      setError(
        invalid
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
          className={`text-input ${error ? 'input-error' : ''}`}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Entrando…' : 'Entrar'}
      </button>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <p className="card-footer">
        Não tem conta? <Link href="/register">Cadastre-se</Link>
      </p>
    </form>
  );
}
