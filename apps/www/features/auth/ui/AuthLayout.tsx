import type { ReactNode } from 'react';
import { LogoIcon } from './icons';
import './auth-layout.css';

// Painel azul da marca + área do cartão. Usado por login, cadastro e verificação.
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="auth-brand">
          <LogoIcon />
          <span>
            Movie<b>Match</b>
          </span>
        </div>

        <div className="auth-hero-text">
          <h2>Encontre quem tem o mesmo gosto para filmes.</h2>
          <p>
            Avalie o que você assistiu e conecte-se com pessoas de gosto
            parecido.
          </p>
        </div>

        <div className="auth-posters" aria-hidden="true">
          <span className="auth-poster auth-poster-blue" />
          <span className="auth-poster auth-poster-orange" />
          <span className="auth-poster auth-poster-teal" />
          <span className="auth-match">
            <span className="auth-check">✓</span>92% de match
          </span>
        </div>

        <div className="auth-ratings" aria-hidden="true">
          <span>
            <span className="auth-stars">★★★★☆</span>4,0 · você
          </span>
          <span>
            <span className="auth-stars">★★★★☆</span>4,5 · Lara
          </span>
        </div>

        <small>© 2026 MovieMatch</small>
      </aside>

      <main className="auth-panel">{children}</main>
    </div>
  );
}

export function AuthCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="auth-card">
      <h1>{title}</h1>
      {children}
    </section>
  );
}
