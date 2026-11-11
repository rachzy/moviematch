'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { login as loginRequest } from '../api'; // a chamada à API continua sendo a do grupo
import type { LoginResponse } from '../types';
import { tokenStorage } from '@/shared/lib/auth';

type AuthContextValue = {
  token: string | null;
  ready: boolean; // false até lermos o localStorage no navegador
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Só no navegador conseguimos ler o token salvo.
  useEffect(() => {
    setToken(tokenStorage.get());
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // O api.ts hoje tipa a resposta como { message }. Lemos o token como campo opcional
    // até a API passar a devolvê-lo e o tipo ser atualizado por quem mantém o api.ts.
    const data: LoginResponse = await loginRequest({ email, password });
    const accessToken = data.accessToken;
    // Sem token não existe sessão. Falhar aqui evita "entrar" e ser devolvida ao login pela rota protegida.
    if (!accessToken) throw new Error('A resposta do login não trouxe token');
    tokenStorage.set(accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    router.replace('/');
  }, [router]);

  const value = useMemo(
    () => ({ token, ready, login, logout }),
    [token, ready, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
