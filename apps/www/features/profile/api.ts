import { http } from '@/shared/lib/http';
import type { UpdateProfileInput, UserProfile } from './types';

export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await http.get<UserProfile>('/users/me');
  return data;
}

export async function updateMyProfile(
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const { data } = await http.patch<UserProfile>('/users/me', input);
  return data;
}
