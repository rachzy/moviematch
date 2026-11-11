import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

const replace = vi.fn();
const auth = { token: null as string | null, ready: true };
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('./AuthContext', () => ({ useAuth: () => auth }));

beforeEach(() => replace.mockClear());

describe('ProtectedRoute', () => {
  it('sem token, redireciona para o login e não mostra o conteúdo', async () => {
    Object.assign(auth, { token: null, ready: true });
    render(<ProtectedRoute>segredo</ProtectedRoute>);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(screen.queryByText('segredo')).not.toBeInTheDocument();
  });

  it('enquanto não está pronto, não redireciona nem mostra o conteúdo', () => {
    Object.assign(auth, { token: null, ready: false });
    render(<ProtectedRoute>segredo</ProtectedRoute>);
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText('segredo')).not.toBeInTheDocument();
  });

  it('com token, mostra o conteúdo', () => {
    Object.assign(auth, { token: 'tok', ready: true });
    render(<ProtectedRoute>segredo</ProtectedRoute>);
    expect(screen.getByText('segredo')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
