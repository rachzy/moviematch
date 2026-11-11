'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useId,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from 'react';
import { register } from '../api';
import { validateRegister, type RegisterErrors } from '../validation';

function Field({
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const errorId = useId();
  return (
    <div className="field">
      <input
        aria-label={props.placeholder}
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email')).trim();
    const username = String(form.get('username')).trim();
    const password = String(form.get('password'));

    const found = validateRegister(email, username, password);
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
        if (message.startsWith('E-mail')) setErrors({ email: message });
        else if (message.startsWith('Username'))
          setErrors({ username: message });
        else setFormError(message);
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
      <Field
        name="username"
        placeholder="Username"
        maxLength={30}
        error={errors.username}
      />
      <Field
        name="password"
        type="password"
        placeholder="Senha (mín. 8 caracteres)"
        maxLength={72}
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
