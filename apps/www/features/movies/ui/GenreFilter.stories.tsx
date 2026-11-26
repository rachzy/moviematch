import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { GenreFilter } from './GenreFilter';
import './movies.css';

const meta = {
  title: 'Movies/GenreFilter',
  component: GenreFilter,
  args: { value: null, onChange: fn() },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 928, margin: '0 auto', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GenreFilter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Todos: Story = {};
export const Drama: Story = { args: { value: 'Drama' } };

export const Interativo: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    return <GenreFilter value={value} onChange={setValue} />;
  },
};
