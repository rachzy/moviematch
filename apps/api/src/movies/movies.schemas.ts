import { z } from 'zod';

export const searchMoviesSchema = z.object({
  q: z.string().max(100).optional(),
  genre: z.string().max(50).optional(),
});

export type SearchMoviesDto = z.infer<typeof searchMoviesSchema>;
