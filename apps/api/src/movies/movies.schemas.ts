import { z } from 'zod';

export const searchMoviesSchema = z.object({
  q: z.string().max(100).optional(),
  genre: z.string().max(50).optional(),
  // Onde procurar o texto: só no título, só no elenco ou nos dois (padrão).
  by: z.enum(['title', 'actor']).optional(),
});

export type SearchMoviesDto = z.infer<typeof searchMoviesSchema>;
