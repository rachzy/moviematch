import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { MovieCard } from './MovieCard';
import './movies.css';

const meta = {
  title: 'Movies/MovieCard',
  component: MovieCard,
  args: {
    movie: {
      id: 1,
      title: 'O Último Farol',
      year: 2019,
      posterUrl: null,
      rating: 4.3,
      genre: 'Drama',
    },
  },
  decorators: [
    (Story) => (
      <ul className="movie-grid" style={{ width: 160 }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof MovieCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SemPoster: Story = {};

export const ComPoster: Story = {
  args: {
    movie: {
      id: 603,
      title: 'Matrix',
      year: 1999,
      rating: 4.1,
      genre: 'Ação',
      posterUrl:
        'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    },
  },
};

export const SemNota: Story = {
  args: {
    movie: {
      id: 2,
      title: 'Filme Novo',
      year: 2026,
      posterUrl: null,
      rating: null,
      genre: null,
    },
  },
};

export const AvaliarNaBusca: Story = { args: { onRate: fn() } };
export const Popular: Story = { args: { plain: true } };
