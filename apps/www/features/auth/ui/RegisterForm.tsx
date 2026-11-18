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
import './register.css';

function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`text-input ${error ? 'input-error' : ''}`}
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
    <div className="login-container">
      {/* Coluna de Banner (Esquerda) */}
      <div className="brand-column">
        <div>
          <div className="brand-header">
            <div className="brand-logo-icon">🎬</div>
            <span className="brand-title">MovieMatch</span>
          </div>

          <div className="brand-hero">
            <h1 className="brand-hero-title">
              Encontre quem tem o mesmo gosto para filmes.
            </h1>
            <p className="brand-hero-subtitle">
              Avalie o que você assistiu e conecte-se com pessoas de gosto
              parecido.
            </p>

            <div className="match-badge">
              <span className="match-check-icon">✓</span>
              <span>92% de match</span>
            </div>
          </div>
        </div>

        <div className="posters-row">
          <div className="poster-item">
            <div className="poster-card poster-blue">
              <div className="poster-circle" />
              <div className="poster-waves" />
            </div>
            <div className="poster-rating">
              <span className="stars-gold">★★★★☆</span> 4,0 · você
            </div>
          </div>

          <div className="poster-item">
            <div className="poster-card poster-orange">
              <div className="poster-circle" />
              <div className="poster-waves" />
            </div>
            <div className="poster-rating">
              <span className="stars-gold">★★★★★</span> 4,5 · Lara
            </div>
          </div>

          <div className="poster-item">
            <div className="poster-card poster-green">
              <div className="poster-circle" />
              <div className="poster-waves" />
            </div>
          </div>
        </div>

        <div className="brand-footer">© 2026 MovieMatch</div>
      </div>

      {/* Coluna do Formulário (Direita) */}
      <div className="form-column">
        <div className="login-card">
          <h2>Criar conta</h2>

          {formError && (
            <div className="error-banner" role="alert">
              {formError}
            </div>
          )}

          <form ref={formRef} onSubmit={onSubmit} noValidate>
            <Field
              label="E-mail"
              name="email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email}
            />
            <Field
              label="Username"
              name="username"
              placeholder="seu_usuario"
              error={errors.username}
            />
            <Field
              label="Senha"
              name="password"
              type="password"
              placeholder="Mín. 8, com maiúscula, minúscula, número e especial"
              error={errors.password}
            />

            <button
              type="submit"
              className="btn-primary btn-submit"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <div className="card-footer">
            Já tem conta? <Link href="/">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
