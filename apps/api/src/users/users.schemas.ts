// Para validação de nickname, avatarUrl e pronouns.
import { z } from 'zod';

const nullableTrimmed = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} deve ter no máximo ${max} caracteres`)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

const avatarUrlSchema = z
  .string()
  .trim()
  .max(500, 'URL da foto deve ter no máximo 500 caracteres')
  .transform((v) => (v === '' ? null : v))
  .refine(
    (v) => v === null || /^https?:\/\/.+/i.test(v),
    'Informe uma URL válida iniciando com http:// ou https://',
  )
  .nullable()
  .optional();

export const updateProfileSchema = z.object({
  nickname: nullableTrimmed(50, 'Apelido'),
  avatarUrl: avatarUrlSchema,
  pronouns: nullableTrimmed(40, 'Pronomes'),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
