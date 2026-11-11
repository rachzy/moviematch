import { LoginForm } from '@/features/auth/ui/LoginForm';

const posters = [
  {
    rating: '4,0',
    user: 'você',
    bg: 'linear-gradient(180deg, #2563EB 0%, #1E3A8A 100%)',
  },
  {
    rating: '4,5',
    user: 'Luiz',
    bg: 'linear-gradient(180deg, #EA580C 0%, #7C2D12 100%)',
  },
  {
    rating: '4,8',
    user: 'Recomendado',
    bg: 'linear-gradient(180deg, #059669 0%, #064E3B 100%)',
  },
];

export default function Home() {
  return (
    <div className="login-container">
      {/* Coluna Esquerda: Marca e Ilustrações */}
      <section className="brand-column">
        <div>
          <div className="brand-header">
            <div className="brand-logo-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="17" x2="22" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
              </svg>
            </div>
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

            <div className="posters-row">
              {posters.map((p) => (
                <div key={p.rating} className="poster-item">
                  <div className="poster-card" style={{ background: p.bg }}>
                    <div className="poster-circle" />
                    <div className="poster-waves" />
                  </div>
                  <div className="poster-rating">
                    <span className="stars-gold">★★★★★</span>
                    <span>
                      {p.rating} · {p.user}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="brand-footer">© 2026 MovieMatch</div>
      </section>

      {/* Coluna Direita: Formulário de Login */}
      <section className="form-column">
        <LoginForm />
      </section>
    </div>
  );
}
