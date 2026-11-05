import { http } from '@/shared/lib/http';
import type { Health } from './types';

export async function getHealth() {
  const { data } = await http.get<Health>('/health');
  return data;
}
