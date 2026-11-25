import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { SearchResults } from './SearchResults';
import './movies.css';

const movies = [
  { id: 1, title: 'O Último Farol', year: 2019, posterUrl: null },
  { id: 2, title: 'A Última Estação', year: 2021, posterUrl: null },
  { id: 3, title: 'Última Chamada', year: 2016, posterUrl: null },
];

const meta = {
  title: 'Movies/SearchResults',
  component: SearchResults,
  args: { status: 'done', movies, query: 'ultim', onClear: fn() },
} satisfies Meta<typeof SearchResults>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inicio: Story = { args: { status: 'idle', movies: [] } };
export const Carregando: Story = { args: { status: 'loading' } };
export const Resultados: Story = {};
export const NenhumFilme: Story = {
  args: { movies: [], query: 'o farrol azull' },
};
export const Erro: Story = { args: { status: 'error', movies: [] } };
