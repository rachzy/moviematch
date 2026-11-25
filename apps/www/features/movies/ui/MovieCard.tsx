import Link from 'next/link';
import type { Movie } from '../types';
import { FilmIcon, StarIcon } from './icons';

type Props = {
  movie: Movie;
  // Sem onRate, "Avaliar" abre a página do filme já na avaliação.
  onRate?: (movie: Movie) => void;
  // Versão simples dos populares: sem moldura e sem botão Avaliar.
  plain?: boolean;
};

const nota = (n: number) => n.toFixed(1).replace('.', ',');

export function MovieCard({ movie, onRate, plain }: Props) {
  const info = [movie.year, movie.genre].filter(Boolean).join(' · ');
  return (
    <li className={plain ? 'movie-card plain' : 'movie-card'}>
      <Link href={`/movies/${movie.id}`} className="movie-link">
        <div className="movie-poster">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={`Pôster de ${movie.title}`} />
          ) : (
            <FilmIcon size={40} />
          )}
          {movie.rating !== null && (
            <span className="movie-badge">
              <StarIcon size={12} />
              {nota(movie.rating)}
            </span>
          )}
          <span className="movie-hover">Ver detalhes</span>
        </div>
        <div className="movie-info">
          <strong title={movie.title}>{movie.title}</strong>
          {info && <span>{info}</span>}
        </div>
      </Link>
      {plain ? null : onRate ? (
        <button
          type="button"
          className="movie-rate"
          onClick={() => onRate(movie)}
          aria-label={`Avaliar ${movie.title}`}
        >
          <StarIcon size={16} /> Avaliar
        </button>
      ) : (
        <Link
          href={`/movies/${movie.id}#avaliacao`}
          className="movie-rate"
          aria-label={`Avaliar ${movie.title}`}
        >
          <StarIcon size={16} /> Avaliar
        </Link>
      )}
    </li>
  );
}
