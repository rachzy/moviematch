import axios, { type AxiosError } from 'axios';
import { tokenStorage } from './auth';

// Única instância do axios; toda feature faz suas requisições por aqui.
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
});

// REQUISIÇÃO: injeta "Authorization: Bearer <token>" se existir token salvo.
http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPOSTA: se o backend disser 401 (token inválido/expirado), encerra a sessão.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    // O próprio login também pode devolver 401 (senha errada).
    // Nesse caso NÃO limpamos nada nem redirecionamos: a tela de login mostra o erro.
    const isLoginRequest = url === '/auth/login';

    if (status === 401 && !isLoginRequest) {
      tokenStorage.clear();
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.assign('/');
      }
    }
    return Promise.reject(error);
  },
);
