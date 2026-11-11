import { http } from '@/shared/lib/http';
import type { LoginInput, RegisterInput } from './types';

type Message = { message: string };

export async function login(input: LoginInput) {
  const { data } = await http.post<Message>('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput) {
  const { data } = await http.post<Message>('/auth/register', input);
  return data;
}

export async function verifyEmail(token: string) {
  const { data } = await http.post<Message>('/auth/verify-email', { token });
  return data;
}

export async function verifyCode(email: string, code: string) {
  const { data } = await http.post<Message>('/auth/verify-code', {
    email,
    code,
  });
  return data;
}

// A API sempre responde 200 com mensagem genérica (cooldown silencioso).
export async function resendVerification(email: string) {
  const { data } = await http.post<Message>('/auth/resend-verification', {
    email,
  });
  return data;
}
