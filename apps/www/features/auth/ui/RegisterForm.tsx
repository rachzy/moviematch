'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
} from 'react';
import { register } from '../api';
import { savePendingEmail } from '../pendingEmail';
import { validateRegister, type RegisterErrors } from '../validation';
import { AuthCard } from './AuthLayout';

function Field({
  label,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const noteId = `${id}-note`;
  // No design o rótulo é o próprio placeholder; o <label> fica só para leitores de tela.
  return (
    <div className="field-group">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        {...props}
        id={id}
        placeholder={label}
        aria-invalid={!!error}
        aria-describedby={error || hint ? noteId : undefined}
        className={`text-input ${error ? 'input-error' : ''}`}
      />
      {(error || hint) && (
        <span id={noteId} className={error ? 'field-error' : 'field-hint'}>
          {error ?? hint}
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
  const formRef = useRef<HTMLFormElement>(null);

  // leva o foco ao primeiro campo com erro
  useEffect(() => {
    formRef.current
      ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
      ?.focus();
  }, [errors]);

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
      savePendingEmail(email);
      router.push('/register/verify');
    } catch (err) {
      const res = axios.isAxiosError(err) ? err.response : undefined;
      if (res?.status === 409) {
        if (res.data?.field === 'email')
          setErrors({ email: 'Este e-mail já está cadastrado.' });
        else if (res.data?.field === 'username')
          setErrors({ username: 'Username já em uso.' });
        else
          setFormError(
            res.data?.message || 'Algo deu errado. Tente novamente.',
          );
      } else if (res?.status === 400 && Array.isArray(res.data)) {
        // issues do zod: mostra a primeira, no campo quando houver
        const { path, message } = res.data[0] ?? {};
        const field = path?.[0];
        if (field === 'email' || field === 'username' || field === 'password')
          setErrors({ [field]: message });
        else setFormError(message || 'Dados inválidos.');
      } else {
        setFormError('Algo deu errado. Tente novamente em instantes.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Criar conta">
      {formError && (
        <div className="error-banner" role="alert">
          {formError}
        </div>
      )}

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <Field label="E-mail" name="email" type="email" error={errors.email} />
        <Field label="Username" name="username" error={errors.username} />
        <Field
          label="Senha"
          name="password"
          type="password"
          hint="Mínimo de 8 caracteres, com maiúscula, minúscula, número e especial"
          error={errors.password}
        />

        <button
          type="submit"
          className="btn-primary btn-submit"
          disabled={loading}
        >
          {loading && <span className="btn-spinner" aria-hidden="true" />}
          {loading ? 'Cadastrando…' : 'Cadastrar'}
        </button>
      </form>

      <p className="card-footer">
        Já tem conta? <Link href="/">Entrar</Link>
      </p>
    </AuthCard>
  );
}
