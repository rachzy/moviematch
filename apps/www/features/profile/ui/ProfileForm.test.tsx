import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../api';
import { ProfileForm } from './ProfileForm';

vi.mock('../api');

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carrega o perfil e salva alterações incluindo remoção de campos', async () => {
    vi.mocked(api.getMyProfile).mockResolvedValue({
      id: '1',
      email: 'caua@example.com',
      username: 'cauagozzer',
      nickname: 'Caua',
      avatarUrl: 'https://example.com/foto.png',
      pronouns: 'ele/dele',
    });

    vi.mocked(api.updateMyProfile).mockResolvedValue({
      id: '1',
      email: 'caua@example.com',
      username: 'cauagozzer',
      nickname: 'Caua',
      avatarUrl: null,
      pronouns: 'ele/dele',
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/apelido/i)).toHaveValue('Caua');
    });

    fireEvent.click(screen.getByRole('button', { name: /remover foto/i }));
    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => {
      expect(api.updateMyProfile).toHaveBeenCalledWith({
        nickname: 'Caua',
        avatarUrl: null,
        pronouns: 'ele/dele',
      });
      expect(screen.getByRole('status')).toHaveTextContent(
        /perfil atualizado\./i,
      );
    });
  });
});