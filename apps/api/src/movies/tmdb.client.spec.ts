import { BadGatewayException } from '@nestjs/common';
import { TmdbClient } from './tmdb.client';

const json = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

const movie = {
  id: 194,
  title: 'Amélie',
  release_date: '2001-04-25',
  poster_path: '/x.jpg',
  genre_ids: [35, 10749],
};

describe('TmdbClient', () => {
  const fetchFn = jest.fn();
  const client = () =>
    new TmdbClient('tok', fetchFn as unknown as typeof fetch);
  const calledUrl = (i = 0): URL => new URL(fetchFn.mock.calls[i][0]);

  beforeEach(() => jest.resetAllMocks());

  describe('searchByTitle', () => {
    it('chama /search/movie com pt-BR e bearer e traduz o resultado', async () => {
      fetchFn.mockResolvedValue(json({ results: [movie] }));

      const result = await client().searchByTitle('amelie');

      const url = calledUrl();
      expect(url.pathname).toBe('/3/search/movie');
      expect(url.searchParams.get('query')).toBe('amelie');
      expect(url.searchParams.get('language')).toBe('pt-BR');
      expect(fetchFn.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
      expect(result).toEqual([
        {
          id: 194,
          title: 'Amélie',
          year: 2001,
          posterUrl: 'https://image.tmdb.org/t/p/w500/x.jpg',
          rating: null,
          genreIds: [35, 10749],
        },
      ]);
    });

    it('trata release_date vazio e poster nulo', async () => {
      fetchFn.mockResolvedValue(
        json({ results: [{ ...movie, release_date: '', poster_path: null }] }),
      );
      const [m] = await client().searchByTitle('x');
      expect(m.year).toBeNull();
      expect(m.posterUrl).toBeNull();
    });

    it('codifica caracteres especiais sem injetar parâmetros', async () => {
      fetchFn.mockResolvedValue(json({ results: [] }));
      await client().searchByTitle('a&b=c#');
      const url = calledUrl();
      expect(url.href).toContain('a%26b%3Dc%23');
      expect(url.searchParams.get('query')).toBe('a&b=c#');
      expect(url.searchParams.has('b')).toBe(false);
    });
  });

  describe('searchByActor', () => {
    it('busca a pessoa e depois os filmes com with_cast', async () => {
      fetchFn
        .mockResolvedValueOnce(json({ results: [{ id: 31 }] }))
        .mockResolvedValueOnce(json({ results: [movie] }));

      const result = await client().searchByActor('tom hanks');

      expect(calledUrl(0).pathname).toBe('/3/search/person');
      expect(calledUrl(1).pathname).toBe('/3/discover/movie');
      expect(calledUrl(1).searchParams.get('with_cast')).toBe('31');
      expect(result).toHaveLength(1);
    });

    it('devolve [] quando não há pessoa', async () => {
      fetchFn.mockResolvedValue(json({ results: [] }));
      expect(await client().searchByActor('zzz')).toEqual([]);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('findGenreId', () => {
    const genres = {
      genres: [
        { id: 28, name: 'Ação' },
        { id: 35, name: 'Comédia' },
      ],
    };

    it('ignora acento e caixa e cacheia a lista', async () => {
      fetchFn.mockResolvedValue(json(genres));
      const c = client();
      expect(await c.findGenreId('ACAO')).toBe(28);
      expect(await c.findGenreId('comedia')).toBe(35);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('devolve null para gênero inexistente', async () => {
      fetchFn.mockResolvedValue(json(genres));
      expect(await client().findGenreId('xyz')).toBeNull();
    });
  });

  describe('nota', () => {
    it('converte a média do TMDB (0–10) para 0–5 com uma casa', async () => {
      fetchFn.mockResolvedValue(
        json({ results: [{ ...movie, vote_average: 8.66, vote_count: 10 }] }),
      );
      const [m] = await client().searchByTitle('x');
      expect(m.rating).toBe(4.3);
    });
  });

  describe('popular e genreName', () => {
    it('popular chama /movie/popular', async () => {
      fetchFn.mockResolvedValue(json({ results: [movie] }));
      expect(await client().popular()).toHaveLength(1);
      expect(calledUrl().pathname).toBe('/3/movie/popular');
    });

    it('genreName usa a mesma lista cacheada', async () => {
      fetchFn.mockResolvedValue(
        json({ genres: [{ id: 35, name: 'Comédia' }] }),
      );
      const c = client();
      expect(await c.genreName(35)).toBe('Comédia');
      expect(await c.genreName(99)).toBeNull();
      expect(await c.genreName(undefined)).toBeNull();
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('discoverByGenre', () => {
    it('usa with_genres', async () => {
      fetchFn.mockResolvedValue(json({ results: [movie] }));
      await client().discoverByGenre(28);
      expect(calledUrl().searchParams.get('with_genres')).toBe('28');
    });
  });

  describe('getMovie', () => {
    it('devolve detalhes com gêneros e no máximo 10 atores', async () => {
      fetchFn.mockResolvedValue(
        json({
          ...movie,
          overview: 'sinopse',
          runtime: 112,
          vote_average: 8.6,
          vote_count: 1284,
          genres: [{ id: 35, name: 'Comédia' }],
          credits: {
            cast: Array.from({ length: 15 }, (_, i) => ({ name: `Ator ${i}` })),
          },
        }),
      );

      const result = await client().getMovie(194);

      expect(calledUrl().pathname).toBe('/3/movie/194');
      expect(calledUrl().searchParams.get('append_to_response')).toBe(
        'credits',
      );
      expect(result).toMatchObject({
        id: 194,
        overview: 'sinopse',
        genres: ['Comédia'],
        runtime: 112,
        rating: 4.3,
        voteCount: 1284,
      });
      expect(result?.cast).toHaveLength(10);
    });

    it('devolve null no 404', async () => {
      fetchFn.mockResolvedValue(json({}, 404));
      expect(await client().getMovie(1)).toBeNull();
    });
  });

  describe('falhas', () => {
    it.each([500, 429])(
      'status %i vira BadGatewayException',
      async (status) => {
        fetchFn.mockResolvedValue(json({}, status));
        await expect(client().searchByTitle('x')).rejects.toThrow(
          BadGatewayException,
        );
      },
    );

    it('erro de rede vira BadGatewayException', async () => {
      fetchFn.mockRejectedValue(new Error('timeout'));
      await expect(client().searchByTitle('x')).rejects.toThrow(
        BadGatewayException,
      );
    });
  });
});
