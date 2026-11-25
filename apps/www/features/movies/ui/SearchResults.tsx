import type { Movie, SearchBy } from '../types';
import { MovieCard } from './MovieCard';
import { CloseIcon, FilmSearchIcon } from './icons';

// O que está sendo mostrado: os populares (tela inicial) ou uma busca.
export type ResultsView =
  | { kind: 'popular' }
  | { kind: 'search'; query: string; by: SearchBy; genre: string | null };

type Props = {
  status: 'loading' | 'done' | 'error';
  movies: Movie[];
  view: ResultsView;
  onClear: () => void;
  onPopular: () => void;
  onRate?: (movie: Movie) => void;
};

function heading(view: ResultsView, count: number) {
  if (view.kind === 'popular') return { title: 'Populares agora', sub: null };
  const n = `${count} ${count === 1 ? 'filme' : 'filmes'}`;
  const where = view.by === 'actor' ? 'no elenco' : 'no título';
  const genre = view.genre ? ` · ${view.genre}` : '';
  if (!view.query) return { title: `${n} de ${view.genre}`, sub: null };
  return {
    title: `${n} com “${view.query}” ${where}${genre}`,
    sub:
      view.by === 'title'
        ? 'A busca ignora acentos e maiúsculas. Clique em um filme para ver os detalhes.'
        : 'Clique em um filme para ver os detalhes.',
  };
}

export function SearchResults({
  status,
  movies,
  view,
  onClear,
  onPopular,
  onRate,
}: Props) {
  if (status === 'loading') {
    return (
      <div aria-busy="true" aria-label="Carregando">
        <div className="skeleton results-skeleton">
          <span />
          <span />
        </div>
        <ul className="movie-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="movie-card skeleton">
              <div className="movie-poster" />
              <div className="movie-info">
                <span />
                <span />
              </div>
              <span className="skeleton-btn" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="empty-state" role="alert">
        <h2>Não foi possível buscar</h2>
        <p>Tente novamente em instantes.</p>
      </div>
    );
  }

  if (movies.length === 0) {
    const query = view.kind === 'search' ? view.query : '';
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FilmSearchIcon size={44} />
        </div>
        <h2>Nenhum filme encontrado</h2>
        {query && (
          <p>
            Não achamos resultados para <strong>“{query}”</strong>.
          </p>
        )}
        <div className="empty-tips">
          <strong>Algumas dicas</strong>
          <ul>
            <li>Confira se o nome está escrito certo</li>
            <li>Use só parte do título, como “farol”</li>
            <li>Busque por um ator ou escolha um gênero</li>
          </ul>
        </div>
        <div className="empty-actions">
          <button type="button" className="btn btn-secondary" onClick={onClear}>
            <CloseIcon size={16} /> Limpar busca
          </button>
          <button type="button" className="btn btn-primary" onClick={onPopular}>
            Ver filmes populares
          </button>
        </div>
      </div>
    );
  }

  const { title, sub } = heading(view, movies.length);
  return (
    <section>
      <h2 className="results-title">{title}</h2>
      {sub && <p className="results-sub">{sub}</p>}
      <ul className="movie-grid">
        {movies.map((m) => (
          <MovieCard
            key={m.id}
            movie={m}
            onRate={onRate}
            plain={view.kind === 'popular'}
          />
        ))}
      </ul>
    </section>
  );
}
