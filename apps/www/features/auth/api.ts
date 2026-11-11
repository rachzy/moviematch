import { http } from '@/shared/lib/http';
import type { LoginInput, RegisterInput, User } from './types';

export async function login(input: LoginInput) {
  const { data } = await http.post<{ message: string }>('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput) {
  const { data } = await http.post<User>('/auth/register', input);
  return data;
}

export async function verifyEmail(token: string) {
  const { data } = await http.post<{ message: string }>('/auth/verify-email', {
    token,
  });
  return data;
}

export function logoutUser() {
  // Remove o token salvo no navegador
  localStorage.removeItem('@moviematch:token');
  // Redireciona para a tela de login
  window.location.href = '/';
}
