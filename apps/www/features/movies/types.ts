// Espelha o que GET /movies devolve para cada filme.
export type Movie = {
  id: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  rating: number | null; // média do TMDB, de 0 a 5
  genre: string | null; // gênero principal
};

// GET /movies/:id
export type MovieDetails = Omit<Movie, 'genre'> & {
  overview: string;
  genres: string[];
  cast: string[];
  runtime: number | null; // minutos
  voteCount: number;
};

// Onde procurar o texto: no título (Filme) ou no elenco (Ator).
export type SearchBy = 'title' | 'actor';

export type SearchParams = { q?: string; genre?: string; by?: SearchBy };
