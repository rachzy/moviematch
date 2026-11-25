// Espelha o MovieSummary devolvido por GET /movies.
export type Movie = {
  id: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
};

// GET /movies/:id
export type MovieDetails = Movie & {
  overview: string;
  genres: string[];
  cast: string[];
};

// Onde procurar o texto; sem `by`, a API busca no título e no elenco.
export type SearchBy = 'title' | 'actor';

export type SearchParams = { q?: string; genre?: string; by?: SearchBy };
