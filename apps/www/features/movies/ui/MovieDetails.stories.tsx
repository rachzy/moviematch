import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { http } from '@/shared/lib/http';
import type { MovieDetails as Details } from '../types';
import { MovieDetails } from './MovieDetails';

const movie: Details = {
  id: 603,
  title: 'Matrix',
  year: 1999,
  posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
  overview:
    'Um hacker descobre que a realidade em que vive é uma simulação controlada por máquinas.',
  genres: ['Ação', 'Ficção científica'],
  cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
};

// Troca o adapter do axios: nenhuma chamada real à API.
function mock(status: number, data?: unknown, delay = 0) {
  return (Story: () => React.JSX.Element) => {
    http.defaults.adapter = (config) =>
      new Promise((resolve, reject) => {
        const response = { data, status, config } as never;
        setTimeout(
          () => (status < 300 ? resolve(response) : reject({ response })),
          delay,
        );
      });
    return <Story />;
  };
}

const meta = {
  title: 'Movies/MovieDetails',
  component: MovieDetails,
  args: { movieId: 603 },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MovieDetails>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Carregando: Story = { decorators: [mock(200, movie, 600000)] };

export const Carregado: Story = {
  decorators: [mock(200, movie)],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', { name: /Matrix/ }),
    ).toBeInTheDocument();
  },
};

export const SemPosterESemSinopse: Story = {
  decorators: [
    mock(200, { ...movie, posterUrl: null, overview: '', cast: [] }),
  ],
};

export const NaoEncontrado: Story = { decorators: [mock(404)] };
export const ErroComRetry: Story = { decorators: [mock(500)] };
