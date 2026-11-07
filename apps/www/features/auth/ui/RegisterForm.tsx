'use client';

import axios from 'axios';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { register } from '../api';

export function RegisterForm() {
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const user = await register({
        email: String(form.get('email')),
        username: String(form.get('username')),
        password: String(form.get('password')),
      });
      setResult({ ok: true, text: `Usuário ${user.username} cadastrado!` });
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.status === 409
          ? err.response.data.message
          : 'Falha no cadastro. Verifique os dados.';
      setResult({ ok: false, text: message });
    }
  }

  return (
    <form className="auth" onSubmit={onSubmit}>
      <h1>
        Movie<span>Match</span>
      </h1>
      <input name="email" type="email" placeholder="E-mail" required />
      <input
        name="username"
        placeholder="Username"
        minLength={3}
        maxLength={30}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Senha (mín. 8 caracteres)"
        minLength={8}
        required
      />
      <button type="submit">Cadastrar</button>
      {result && <p className={result.ok ? 'ok' : 'error'}>{result.text}</p>}
      <p>
        Já tem conta? <Link href="/">Entrar</Link>
      </p>
    </form>
  );
}
