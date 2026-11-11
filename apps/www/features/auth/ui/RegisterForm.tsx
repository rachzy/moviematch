'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { register } from '../api';

type Errors = { email?: string; username?: string; password?: string };

function validate(email: string, username: string, password: string) {
  const errors: Errors = {};

  if (!email) errors.email = 'Informe seu e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Digite um e-mail válido.';

  if (!username) errors.username = 'Informe um username.';
  else if (username.length < 3 || username.length > 30)
    errors.username = 'O username deve ter de 3 a 30 caracteres.';
  else if (!/^[a-zA-Z0-9_]+$/.test(username))
    errors.username = 'Use apenas letras, números e _';

  if (!password) errors.password = 'Crie uma senha.';
  else if (password.length < 8)
    errors.password = 'A senha deve ter no mínimo 8 caracteres.';
  else if (password.length > 72)
    errors.password = 'A senha deve ter no máximo 72 caracteres.';

  return errors;
}

function Field({
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div className="field">
      <input {...props} aria-invalid={!!error} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email')).trim();
    const username = String(form.get('username')).trim();
    const password = String(form.get('password'));

    const found = validate(email, username, password);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await register({ email, username, password });
      router.push(`/register/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        // o backend devolve "E-mail já cadastrado" ou "Username já em uso"
        const message = String(err.response.data.message);
        setErrors(
          message.startsWith('E-mail')
            ? { email: message }
            : { username: message },
        );
      } else {
        setFormError('Algo deu errado. Tente novamente em instantes.');
      }
      setLoading(false);
    }
  }

  return (
    <form className="auth" onSubmit={onSubmit} noValidate>
      <h1>
        Movie<span>Match</span>
      </h1>
      {formError && (
        <p className="alert" role="alert">
          {formError}
        </p>
      )}
      <Field
        name="email"
        type="email"
        placeholder="E-mail"
        error={errors.email}
      />
      <Field name="username" placeholder="Username" error={errors.username} />
      <Field
        name="password"
        type="password"
        placeholder="Senha (mín. 8 caracteres)"
        error={errors.password}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>
      <p>
        Já tem conta? <Link href="/">Entrar</Link>
      </p>
    </form>
  );
}
