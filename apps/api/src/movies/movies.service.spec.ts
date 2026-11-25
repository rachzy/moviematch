import { NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import type { MovieSummary, TmdbClient } from './tmdb.client';

const m = (id: number, genreIds: number[] = []): MovieSummary => ({
  id,
  title: `Filme ${id}`,
  year: 2000,
  posterUrl: null,
  rating: 4.2,
  genreIds,
});

describe('MoviesService', () => {
  const tmdb = {
    searchByTitle: jest.fn(),
    searchByActor: jest.fn(),
    discoverByGenre: jest.fn(),
    findGenreId: jest.fn(),
    genreName: jest.fn(),
    popular: jest.fn(),
    getMovie: jest.fn(),
  };
  const service = new MoviesService(tmdb as unknown as TmdbClient);

  beforeEach(() => {
    jest.resetAllMocks();
    tmdb.searchByTitle.mockResolvedValue([]);
    tmdb.searchByActor.mockResolvedValue([]);
    tmdb.genreName.mockImplementation(async (id?: number) =>
      id === 28 ? 'Ação' : null,
    );
  });

  describe('search', () => {
    it.each([{}, { q: '' }, { q: '   ' }])(
      'sem q nem genre devolve os populares (%j)',
      async (dto) => {
        tmdb.popular.mockResolvedValue([m(7, [28])]);
        expect(await service.search(dto)).toEqual([
          {
            id: 7,
            title: 'Filme 7',
            year: 2000,
            posterUrl: null,
            rating: 4.2,
            genre: 'Ação',
          },
        ]);
        expect(tmdb.searchByTitle).not.toHaveBeenCalled();
        expect(tmdb.discoverByGenre).not.toHaveBeenCalled();
      },
    );

    it('junta título e ator sem duplicar, título primeiro', async () => {
      tmdb.searchByTitle.mockResolvedValue([m(1), m(2)]);
      tmdb.searchByActor.mockResolvedValue([m(2), m(3)]);
      const result = await service.search({ q: 'x' });
      expect(result.map((r) => r.id)).toEqual([1, 2, 3]);
    });

    it('by=title busca só no título', async () => {
      tmdb.searchByTitle.mockResolvedValue([m(1)]);
      tmdb.searchByActor.mockResolvedValue([m(2)]);
      const result = await service.search({ q: 'x', by: 'title' });
      expect(result.map((r) => r.id)).toEqual([1]);
      expect(tmdb.searchByActor).not.toHaveBeenCalled();
    });

    it('by=actor busca só no elenco', async () => {
      tmdb.searchByTitle.mockResolvedValue([m(1)]);
      tmdb.searchByActor.mockResolvedValue([m(2)]);
      const result = await service.search({ q: 'x', by: 'actor' });
      expect(result.map((r) => r.id)).toEqual([2]);
      expect(tmdb.searchByTitle).not.toHaveBeenCalled();
    });

    it('q + genre mantém só filmes do gênero', async () => {
      tmdb.findGenreId.mockResolvedValue(28);
      tmdb.searchByTitle.mockResolvedValue([m(1, [28]), m(2, [35])]);
      tmdb.searchByActor.mockResolvedValue([m(3, [28, 35])]);
      const result = await service.search({ q: 'x', genre: 'acao' });
      expect(result.map((r) => r.id)).toEqual([1, 3]);
    });

    it('só genre usa discoverByGenre', async () => {
      tmdb.findGenreId.mockResolvedValue(28);
      tmdb.discoverByGenre.mockResolvedValue([m(1, [28])]);
      expect(await service.search({ genre: 'acao' })).toHaveLength(1);
      expect(tmdb.discoverByGenre).toHaveBeenCalledWith(28);
    });

    it('gênero desconhecido devolve []', async () => {
      tmdb.findGenreId.mockResolvedValue(null);
      expect(await service.search({ genre: 'xyz' })).toEqual([]);
      expect(await service.search({ q: 'x', genre: 'xyz' })).toEqual([]);
    });

    it('limita a 50 e não expõe genreIds', async () => {
      tmdb.searchByTitle.mockResolvedValue(
        Array.from({ length: 60 }, (_, i) => m(i, [1])),
      );
      const result = await service.search({ q: 'x' });
      expect(result).toHaveLength(50);
      expect(result[0]).toEqual({
        id: 0,
        title: 'Filme 0',
        year: 2000,
        posterUrl: null,
        rating: 4.2,
        genre: null,
      });
    });
  });

  describe('findOne', () => {
    it('devolve os detalhes', async () => {
      const details = {
        id: 1,
        title: 'a',
        year: 2000,
        posterUrl: null,
        overview: '',
        genres: [],
        cast: [],
      };
      tmdb.getMovie.mockResolvedValue(details);
      expect(await service.findOne(1)).toBe(details);
    });

    it('lança NotFoundException quando não existe', async () => {
      tmdb.getMovie.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
