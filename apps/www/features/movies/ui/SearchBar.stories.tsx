import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { SearchBar } from './SearchBar';
import './movies.css';

const meta = {
  title: 'Movies/SearchBar',
  component: SearchBar,
  args: { value: '', onChange: fn(), onSubmit: fn() },
} satisfies Meta<typeof SearchBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {};
export const Preenchido: Story = { args: { value: 'ultim' } };
export const Buscando: Story = { args: { value: 'ultim', loading: true } };

export const Interativo: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');
    return <SearchBar {...args} value={value} onChange={setValue} />;
  },
};
