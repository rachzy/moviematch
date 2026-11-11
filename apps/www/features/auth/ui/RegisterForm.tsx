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

  if (!password) errors.password = 'Crie uma senha.';
  else if (password.length < 8)
    errors.password = 'A senha deve ter no mínimo 8 caracteres.';

  return errors;
}

function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <input
        {...props}
        aria-invalid={!!error}
        className={`text-input ${error ? 'input-error' : ''}`}
      />
      {error && (
        <span style={{ color: 'var(--error)', fontSize: '0.825rem', marginTop: '4px' }}>
          {error}
        </span>
      )}
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
        const message = String(err.response.data.message ?? '');
        if (message.toLowerCase().includes('email') || message.toLowerCase().includes('e-mail')) {
          setErrors({ email: 'Este e-mail já está cadastrado.' });
        } else {
          setErrors({ username: 'Username já em uso.' });
        }
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
            <h1 className="brand-hero-title">Encontre quem tem o mesmo gosto para filmes.</h1>
            <p className="brand-hero-subtitle">
              Avalie o que você assistiu e conecte-se com pessoas de gosto parecido.
            </p>

            <div className="match-badge">
              <span className="match-check-icon">✓</span>
              <span>92% de match</span>
            </div>
          </div>
        </div>

        <div className="posters-row">
          <div className="poster-item">
            <div className="poster-card" style={{ background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)' }}>
              <div className="poster-circle" />
              <div className="poster-waves" />
            </div>
            <div className="poster-rating">
              <span className="stars-gold">★★★★☆</span> 4,0 · você
            </div>
          </div>

          <div className="poster-item">
            <div className="poster-card" style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}>
              <div className="poster-circle" />
              <div className="poster-waves" />
            </div>
            <div className="poster-rating">
              <span className="stars-gold">★★★★★</span> 4,5 · Lara
            </div>
          </div>

          <div className="poster-item">
            <div className="poster-card" style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}>
              <div className="poster-circle" />
              <div className="poster-waves" />
            </div>
          </div>
        </div>

        <div className="brand-footer">
          © 2026 MovieMatch
        </div>
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

          <form onSubmit={onSubmit} noValidate>
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
              placeholder="••••••••"
              error={errors.password}
            />

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
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