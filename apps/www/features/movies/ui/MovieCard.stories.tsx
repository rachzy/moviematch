import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MovieCard } from './MovieCard';
import './movies.css';

const meta = {
  title: 'Movies/MovieCard',
  component: MovieCard,
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

export const SemPoster: Story = {
  args: {
    movie: { id: 1, title: 'O Último Farol', year: 2019, posterUrl: null },
  },
};

export const ComPoster: Story = {
  args: {
    movie: {
      id: 603,
      title: 'Matrix',
      year: 1999,
      posterUrl:
        'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    },
  },
};
