import { z } from 'zod';

const value = z.number().int().min(1).max(5);
// '' vira null (apaga o comentário); ausente = não altera.
const comment = z
  .string()
  .trim()
  .max(1000)
  .transform((c) => c || null)
  .optional();

export const upsertRatingSchema = z.object({ value, comment });

export const updateRatingSchema = z
  .object({ value: value.optional(), comment })
  .refine((b) => b.value !== undefined || b.comment !== undefined, {
    message: 'Informe value ou comment',
  });

export type UpsertRatingDto = z.infer<typeof upsertRatingSchema>;
export type UpdateRatingDto = z.infer<typeof updateRatingSchema>;
