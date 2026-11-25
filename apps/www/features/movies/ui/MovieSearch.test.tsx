import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { searchMovies } from '../api';
import type { Movie } from '../types';
import { MovieSearch } from './MovieSearch';

vi.mock('../api', () => ({ searchMovies: vi.fn() }));

const farol: Movie = {
  id: 1,
  title: 'O Último Farol',
  year: 2019,
  posterUrl: null,
  rating: 4.3,
  genre: 'Drama',
};

describe('MovieSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(searchMovies).mockResolvedValue([farol]);
  });

  it('abre com os populares, sem botão Avaliar', async () => {
    render(<MovieSearch onRate={vi.fn()} />);
    expect(await screen.findByText('Populares agora')).toBeInTheDocument();
    expect(searchMovies).toHaveBeenCalledWith({
      q: undefined,
      genre: undefined,
      by: undefined,
    });
    expect(screen.queryByRole('button', { name: /Avaliar/ })).toBeNull();
  });

  it('busca por ator e avalia pelo cartão', async () => {
    const onRate = vi.fn();
    render(<MovieSearch onRate={onRate} />);
    await screen.findByText('Populares agora');

    await userEvent.click(screen.getByRole('button', { name: 'Ator' }));
    await userEvent.type(
      screen.getByPlaceholderText('Digite o nome do ator'),
      'helena',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(searchMovies).toHaveBeenLastCalledWith({
      q: 'helena',
      genre: undefined,
      by: 'actor',
    });
    expect(
      await screen.findByText('1 filme com “helena” no elenco'),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Avaliar O Último Farol' }),
    );
    expect(onRate).toHaveBeenCalledWith(farol);
  });

  it('sem resultado, "Ver filmes populares" volta para os populares', async () => {
    render(<MovieSearch />);
    await screen.findByText('Populares agora');
    vi.mocked(searchMovies).mockResolvedValueOnce([]);
    await userEvent.type(screen.getByRole('textbox'), 'xyz');
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Ver filmes populares' }),
    );
    expect(await screen.findByText('Populares agora')).toBeInTheDocument();
  });
});
