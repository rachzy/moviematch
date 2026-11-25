import { z } from 'zod';

export const affinityQuerySchema = z.object({
  minSharedMovies: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AffinityQueryDto = z.infer<typeof affinityQuerySchema>;
