import { z } from 'zod';

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(500).nullable().optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: 'Informe a nota ou o comentário para atualizar',
  });

export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;