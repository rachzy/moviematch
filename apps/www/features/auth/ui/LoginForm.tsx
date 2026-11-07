'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { login } from '../api';

export function LoginForm() {
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const data = await login({
        email: String(form.get('email')),
        password: String(form.get('password')),
      });
      setResult({ ok: true, text: data.message });
    } catch {
      setResult({ ok: false, text: 'Falha no login' });
    }
  }

  return (
    <form className="auth" onSubmit={onSubmit}>
      <h1>
        Movie<span>Match</span>
      </h1>
      <input name="email" type="email" placeholder="E-mail" required />
      <input name="password" type="password" placeholder="Senha" required />
      <button type="submit">Entrar</button>
      {result && <p className={result.ok ? 'ok' : 'error'}>{result.text}</p>}
      <p>
        Não tem conta? <Link href="/register">Cadastre-se</Link>
      </p>
    </form>
  );
}
