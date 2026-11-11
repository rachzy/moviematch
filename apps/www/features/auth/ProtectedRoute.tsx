'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

// SCRUM-61: envolve qualquer página restrita.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token, ready } = useAuth();
    const router = useRouter();

    useEffect(() => {
    if (ready && !token) router.replace('/');
    }, [ready, token, router]);

  // Enquanto não sabemos (ou vamos redirecionar), não mostra conteúdo restrito.
    if (!ready || !token) return null;
    return <>{children}</>;
}