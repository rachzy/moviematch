import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getMyRating, saveRating } from '../api';
import { RateMovieModal } from './RateMovieModal';

vi.mock('../api', () => ({ getMyRating: vi.fn(), saveRating: vi.fn() }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

const movie = {
  id: 2,
  title: 'A Última Estação',
  year: 2021,
  genre: 'Suspense',
  posterUrl: null,
};

describe('RateMovieModal', () => {
  beforeEach(() => vi.resetAllMocks());

  it('envia nota e comentário, fecha e avisa', async () => {
    vi.mocked(getMyRating).mockResolvedValue(null);
    vi.mocked(saveRating).mockResolvedValue({
      value: 5,
      comment: 'Ótimo',
      createdAt: '',
    });
    const onClose = vi.fn();
    render(<RateMovieModal movie={movie} onClose={onClose} />);

    expect(screen.getByText('2021 · Suspense')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('5 estrelas'));
    await userEvent.type(screen.getByLabelText(/Seu comentário/), 'Ótimo');
    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar avaliação' }),
    );

    expect(saveRating).toHaveBeenCalledWith(2, 5, 'Ótimo');
    expect(onClose).toHaveBeenCalled();
    expect(await screen.findByText('Avaliação salva!')).toBeInTheDocument();
  });

  it('preenche com a avaliação que já existia', async () => {
    vi.mocked(getMyRating).mockResolvedValue({
      value: 3,
      comment: 'Bom',
      createdAt: '',
    });
    render(<RateMovieModal movie={movie} onClose={vi.fn()} />);
    expect(
      await screen.findByRole('heading', { name: 'Editar avaliação' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Seu comentário/)).toHaveValue('Bom');
  });
});
