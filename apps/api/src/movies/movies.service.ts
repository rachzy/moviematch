import { Injectable, NotFoundException } from '@nestjs/common';
import type { SearchMoviesDto } from './movies.schemas';
import { TmdbClient, type MovieSummary } from './tmdb.client';

const LIMIT = 50;

@Injectable()
export class MoviesService {
  constructor(private readonly tmdb: TmdbClient) {}

  async search(dto: SearchMoviesDto) {
    const q = dto.q?.trim();
    const genre = dto.genre?.trim();
    let movies: MovieSummary[] = [];
    const genreId = genre ? await this.tmdb.findGenreId(genre) : undefined;
    if (genre && genreId === null) return [];

    if (!q && !genre) movies = await this.tmdb.popular();
    else if (q) {
      const [byTitle, byActor] = await Promise.all([
        dto.by === 'actor' ? [] : this.tmdb.searchByTitle(q),
        dto.by === 'title' ? [] : this.tmdb.searchByActor(q),
      ]);
      const seen = new Set<number>();
      movies = [...byTitle, ...byActor].filter(
        (m) => !seen.has(m.id) && seen.add(m.id),
      );
      if (genreId) movies = movies.filter((m) => m.genreIds.includes(genreId));
    } else if (genreId) {
      movies = await this.tmdb.discoverByGenre(genreId);
    }

    // Troca a lista de ids pelo nome do gênero principal, mostrado no cartão.
    return Promise.all(
      movies.slice(0, LIMIT).map(async ({ genreIds, ...m }) => ({
        ...m,
        genre: await this.tmdb.genreName(genreIds[0]),
      })),
    );
  }

  async findOne(id: number) {
    const movie = await this.tmdb.getMovie(id);
    if (!movie) throw new NotFoundException('Filme não encontrado');
    return movie;
  }
}
