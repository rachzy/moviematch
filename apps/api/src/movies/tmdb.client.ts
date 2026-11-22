import { BadGatewayException } from '@nestjs/common';

export type MovieSummary = {
  id: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genreIds: number[];
};

export type MovieDetails = Omit<MovieSummary, 'genreIds'> & {
  overview: string;
  genres: string[];
  cast: string[];
};

type TmdbMovie = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  genre_ids?: number[];
};

const BASE = 'https://api.themoviedb.org/3';
const IMAGE = 'https://image.tmdb.org/t/p/w500';

// Sem acento e sem diferença de caixa.
const normalize = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

const toSummary = (m: TmdbMovie): MovieSummary => ({
  id: m.id,
  title: m.title,
  year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
  posterUrl: m.poster_path ? IMAGE + m.poster_path : null,
  genreIds: m.genre_ids ?? [],
});

// Único lugar que fala com o TMDB.
export class TmdbClient {
  private genres?: Promise<{ id: number; name: string }[]>;

  constructor(
    private readonly token: string,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  private async get<T>(path: string, params: Record<string, string | number> = {}) {
    const url = new URL(BASE + path);
    url.search = new URLSearchParams({ language: 'pt-BR', ...params } as Record<
      string,
      string
    >).toString();
    let res: Response;
    try {
      res = await this.fetchFn(url.toString(), {
        headers: { Authorization: `Bearer ${this.token}` },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new BadGatewayException('TMDB indisponível');
    }
    if (res.status === 404) return null;
    if (!res.ok) throw new BadGatewayException(`TMDB respondeu ${res.status}`);
    return (await res.json()) as T;
  }

  private async list(path: string, params: Record<string, string | number>) {
    const body = await this.get<{ results: TmdbMovie[] }>(path, params);
    return (body?.results ?? []).map(toSummary);
  }

  searchByTitle(query: string) {
    return this.list('/search/movie', { query });
  }

  async searchByActor(query: string) {
    const people = await this.get<{ results: { id: number }[] }>('/search/person', {
      query,
    });
    const person = people?.results[0];
    return person ? this.list('/discover/movie', { with_cast: person.id }) : [];
  }

  discoverByGenre(genreId: number) {
    return this.list('/discover/movie', { with_genres: genreId });
  }

  async findGenreId(name: string) {
    this.genres ??= this.get<{ genres: { id: number; name: string }[] }>(
      '/genre/movie/list',
    ).then((b) => b?.genres ?? []);
    const wanted = normalize(name);
    const found = (await this.genres).find((g) => normalize(g.name) === wanted);
    return found?.id ?? null;
  }

  async getMovie(id: number): Promise<MovieDetails | null> {
    const m = await this.get<
      TmdbMovie & {
        overview: string;
        genres: { name: string }[];
        credits: { cast: { name: string }[] };
      }
    >(`/movie/${id}`, { append_to_response: 'credits' });
    if (!m) return null;
    const { genreIds: _ignored, ...summary } = toSummary(m);
    return {
      ...summary,
      overview: m.overview,
      genres: m.genres.map((g) => g.name),
      cast: m.credits.cast.slice(0, 10).map((c) => c.name),
    };
  }
}
