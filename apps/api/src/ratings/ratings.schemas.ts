import { z } from 'zod';

export const upsertRatingSchema = z.object({
  value: z.number().int().min(1).max(5),
  // Comentário opcional; vazio vira null.
  comment: z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((c) => c || null),
});

export type UpsertRatingDto = z.infer<typeof upsertRatingSchema>;
