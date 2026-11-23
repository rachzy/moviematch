import { z } from 'zod';

export const upsertRatingSchema = z.object({
  value: z.number().int().min(1).max(5),
});

export type UpsertRatingDto = z.infer<typeof upsertRatingSchema>;