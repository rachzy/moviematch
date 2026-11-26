// Espelha o MovieSummary devolvido por GET /movies.
export type Movie = {
  id: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
};

export type SearchParams = { q?: string; genre?: string };
