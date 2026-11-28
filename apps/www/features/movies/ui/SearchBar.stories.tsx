import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import type { SearchMode } from '../types';
import { SearchBar } from './SearchBar';
import './movies.css';

const meta = {
  title: 'Movies/SearchBar',
  component: SearchBar,
  args: {
    mode: 'movie',
    value: '',
    onModeChange: fn(),
    onChange: fn(),
    onSubmit: fn(),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 928, margin: '0 auto', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {};
export const Preenchido: Story = { args: { value: 'ultim' } };
export const Buscando: Story = { args: { value: 'ultim', loading: true } };

export const BuscandoAtor: Story = { args: { mode: 'actor', value: 'keanu' } };

export const Interativo: Story = {
  render: function Render(args) {
    const [mode, setMode] = useState<SearchMode>('movie');
    const [value, setValue] = useState('');
    return (
      <SearchBar
        {...args}
        mode={mode}
        onModeChange={setMode}
        value={value}
        onChange={setValue}
      />
    );
  },
};
