import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import type { Movie } from '../types';
import { SearchResults } from './SearchResults';
import './movies.css';

const movie = (id: number, title: string, year: number, genre: string) =>
  ({ id, title, year, genre, rating: 4.1, posterUrl: null }) as Movie;
const movies = [
  movie(1, 'O Último Farol', 2019, 'Drama'),
  movie(2, 'A Última Estação', 2021, 'Suspense'),
  movie(3, 'Última Chamada', 2016, 'Ação'),
];

const meta = {
  title: 'Movies/SearchResults',
  component: SearchResults,
  args: {
    status: 'done',
    movies,
    view: { kind: 'search', query: 'ultim', by: 'title', genre: null },
    onClear: fn(),
    onPopular: fn(),
    onRate: fn(),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 928, margin: '0 auto', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchResults>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Populares: Story = { args: { view: { kind: 'popular' } } };
export const Carregando: Story = { args: { status: 'loading' } };
export const ResultadosPorFilme: Story = {};
export const ResultadosPorAtor: Story = {
  args: {
    view: { kind: 'search', query: 'helena', by: 'actor', genre: 'Drama' },
  },
};
export const SoGenero: Story = {
  args: { view: { kind: 'search', query: '', by: 'title', genre: 'Drama' } },
};
export const NenhumFilme: Story = {
  args: {
    movies: [],
    view: { kind: 'search', query: 'o farrol azull', by: 'title', genre: null },
  },
};
export const Erro: Story = { args: { status: 'error', movies: [] } };
