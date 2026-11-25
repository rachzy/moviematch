import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { SearchBy } from '../types';
import { SearchByFilter } from './SearchByFilter';
import './movies.css';

const meta = {
  title: 'Movies/SearchByFilter',
  component: SearchByFilter,
  args: { value: null, onChange: fn() },
} satisfies Meta<typeof SearchByFilter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FilmeOuAtor: Story = {};
export const NomeDoFilme: Story = { args: { value: 'title' } };
export const AtorOuAtriz: Story = { args: { value: 'actor' } };

export const Interativo: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<SearchBy | null>(null);
    return <SearchByFilter {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const actor = c.getByRole('button', { name: 'Ator ou atriz' });
    await userEvent.click(actor);
    await expect(actor).toHaveAttribute('aria-pressed', 'true');
  },
};
