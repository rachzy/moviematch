export type SearchMode = 'movie' | 'actor';

// Espelha o MovieSummary devolvido por GET /movies.
export type Movie = {
  id: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genre?: string | null;
  studio?: string | null;
  actors?: string[];
};

export type SearchParams = {
  q?: string;
  genre?: string;
  studio?: string;
  actor?: string;
};