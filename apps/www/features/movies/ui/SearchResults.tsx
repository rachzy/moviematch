import type { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { FilmIcon } from './icons';

type Props = {
  status: 'idle' | 'loading' | 'done' | 'error';
  movies: Movie[];
  query: string;
  onClear: () => void;
};

export function SearchResults({ status, movies, query, onClear }: Props) {
  if (status === 'idle') {
    return (
      <p className="results-hint">
        Busque por título ou ator, ou escolha um gênero para começar.
      </p>
    );
  }

  if (status === 'loading') {
    return (
      <ul className="movie-grid" aria-busy="true" aria-label="Carregando">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="movie-card skeleton">
            <div className="movie-poster" />
            <div className="movie-info">
              <span />
              <span />
            </div>
          </li>
        ))}
      </ul>
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
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <FilmIcon size={40} />
        </div>
        <h2>Nenhum filme encontrado</h2>
        {query && (
          <p>
            Não achamos resultados para <strong>“{query}”</strong>.
          </p>
        )}
        <ul className="empty-tips">
          <li>Confira se o nome está escrito certo</li>
          <li>Use só parte do título, como “farol”</li>
          <li>Busque por um ator ou escolha um gênero</li>
        </ul>
        <button type="button" className="btn btn-secondary" onClick={onClear}>
          Limpar busca
        </button>
      </div>
    );
  }

  return (
    <section>
      <h2 className="results-title">
        {movies.length} {movies.length === 1 ? 'filme' : 'filmes'}
        {query && <> com “{query}”</>}
      </h2>
      <ul className="movie-grid">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </ul>
    </section>
  );
}
