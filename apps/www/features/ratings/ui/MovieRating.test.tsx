import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteRating, getMyRating, saveRating } from '../api';
import type { Rating } from '../types';
import { MovieRating } from './MovieRating';

vi.mock('../api', () => ({
  getMyRating: vi.fn(),
  saveRating: vi.fn(),
  deleteRating: vi.fn(),
}));

// O jsdom não implementa showModal/close.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

const saved: Rating = {
  value: 4,
  comment: 'Roteiro ótimo',
  createdAt: '2026-11-20T12:00:00Z',
};

describe('MovieRating', () => {
  beforeEach(() => vi.resetAllMocks());

  it('envia nota e comentário e mostra Editar/Excluir', async () => {
    vi.mocked(getMyRating).mockResolvedValue(null);
    vi.mocked(saveRating).mockResolvedValue(saved);
    render(<MovieRating movieId={7} />);

    await userEvent.click(await screen.findByLabelText('4 estrelas'));
    await userEvent.type(
      screen.getByLabelText(/Seu comentário/),
      'Roteiro ótimo',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar avaliação' }),
    );

    expect(saveRating).toHaveBeenCalledWith(7, 4, 'Roteiro ótimo');
    expect(
      await screen.findByText('Roteiro ótimo', { selector: 'p' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
  });

  it('edita com o formulário já preenchido', async () => {
    vi.mocked(getMyRating).mockResolvedValue(saved);
    vi.mocked(saveRating).mockResolvedValue({ ...saved, value: 5 });
    render(<MovieRating movieId={7} />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Editar avaliação' });
    expect(
      within(dialog).getByText('Antes: 4 · Muito bom'),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('textbox')).toHaveValue('Roteiro ótimo');

    await userEvent.click(within(dialog).getByLabelText('5 estrelas'));
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Salvar alterações' }),
    );

    expect(saveRating).toHaveBeenCalledWith(7, 5, 'Roteiro ótimo');
    expect(
      await screen.findByText('Avaliação atualizada!'),
    ).toBeInTheDocument();
  });

  it('exclui depois de confirmar e volta ao formulário vazio', async () => {
    vi.mocked(getMyRating).mockResolvedValue(saved);
    vi.mocked(deleteRating).mockResolvedValue();
    render(<MovieRating movieId={7} />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Excluir' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Excluir avaliação?' });
    expect(dialog).toHaveTextContent('matches');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );

    expect(deleteRating).toHaveBeenCalledWith(7);
    expect(
      await screen.findByRole('button', { name: 'Enviar avaliação' }),
    ).toBeDisabled();
    expect(screen.getByText('Avaliação excluída')).toBeInTheDocument();
  });

  it('mantém a avaliação e avisa se a exclusão falhar', async () => {
    vi.mocked(getMyRating).mockResolvedValue(saved);
    vi.mocked(deleteRating).mockRejectedValue(new Error('500'));
    render(<MovieRating movieId={7} />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Excluir' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Excluir avaliação?' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );

    expect(
      await within(dialog).findByText(
        'Não foi possível excluir. Tente novamente.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Roteiro ótimo', { selector: 'p' }),
    ).toBeInTheDocument();
  });
});
