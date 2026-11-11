import { http } from '@/shared/lib/http';
import type { LoginInput, LoginResponse, RegisterInput, User } from './types';

export async function login(input: LoginInput) {
  const { data } = await http.post<LoginResponse>('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput) {
  const { data } = await http.post<User>('/auth/register', input);
  return data;
}
