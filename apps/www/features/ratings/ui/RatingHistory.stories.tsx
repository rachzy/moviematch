import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HistoryView } from './RatingHistory';
import type { RatingHistoryItem } from '../types';
import './history.css';

const items: RatingHistoryItem[] = [
  {
    movieId: 1,
    value: 5,
    updatedAt: '2026-11-20T18:30:00Z',
    movie: { id: 1, title: 'O Último Farol', year: 2019, posterUrl: null },
  },
  {
    movieId: 2,
    value: 3,
    updatedAt: '2026-11-18T10:00:00Z',
    movie: { id: 2, title: 'A Última Estação', year: null, posterUrl: null },
  },
  // TMDB indisponível para este filme
  { movieId: 3, value: 4, updatedAt: '2026-11-10T21:15:00Z', movie: null },
];

const meta = {
  title: 'Ratings/RatingHistory',
  component: HistoryView,
  args: { status: 'done', items },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <section className="history" style={{ padding: 24 }}>
        <h1>Histórico de avaliações</h1>
        <Story />
      </section>
    ),
  ],
} satisfies Meta<typeof HistoryView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Carregando: Story = { args: { status: 'loading', items: [] } };
export const Erro: Story = { args: { status: 'error', items: [] } };
export const Vazio: Story = { args: { items: [] } };
export const Populado: Story = {};
