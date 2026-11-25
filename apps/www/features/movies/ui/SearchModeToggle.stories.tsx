import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { SearchBy } from '../types';
import { SearchModeToggle } from './SearchModeToggle';
import './movies.css';

const meta = {
  title: 'Movies/SearchModeToggle',
  component: SearchModeToggle,
  args: { value: 'title', onChange: fn() },
} satisfies Meta<typeof SearchModeToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Filme: Story = {};
export const Ator: Story = { args: { value: 'actor' } };

export const Interativo: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<SearchBy>('title');
    return <SearchModeToggle {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const ator = within(canvasElement).getByRole('button', { name: 'Ator' });
    await userEvent.click(ator);
    await expect(ator).toHaveAttribute('aria-pressed', 'true');
  },
};
