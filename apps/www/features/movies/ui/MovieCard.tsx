import Link from 'next/link';
import type { Movie } from '../types';
import { FilmIcon } from './icons';

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <li className="movie-card">
      <Link href={`/movies/${movie.id}`} className="movie-link">
        <div className="movie-poster">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={`Pôster de ${movie.title}`} />
          ) : (
            <FilmIcon size={40} />
          )}
        </div>
        <div className="movie-info">
          <strong title={movie.title}>{movie.title}</strong>
          {movie.year && <span>{movie.year}</span>}
        </div>
      </Link>
      {/* Atalho: abre a página do filme já na avaliação. */}
      <Link
        href={`/movies/${movie.id}#avaliacao`}
        className="movie-rate"
        aria-label={`Avaliar ${movie.title}`}
      >
        ★ Avaliar
      </Link>
    </li>
  );
}
