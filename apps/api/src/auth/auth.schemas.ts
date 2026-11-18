import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Formato de e-mail inválido')),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Use apenas letras, números e _'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .max(72)
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[\W_]/, 'A senha deve conter pelo menos um caractere especial'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({ token: z.string().min(1) });

export const verifyCodeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  code: z.string().regex(/^\d{6}$/, 'O código deve ter 6 dígitos'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Formato de e-mail inválido')),
});
export type VerifyCodeDto = z.infer<typeof verifyCodeSchema>;
export type ResendVerificationDto = z.infer<typeof resendVerificationSchema>;
