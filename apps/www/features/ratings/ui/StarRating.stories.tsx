import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { StarRating } from './StarRating';

const meta = {
  title: 'Ratings/StarRating',
  component: StarRating,
  args: { value: 0, onChange: fn() },
} satisfies Meta<typeof StarRating>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithValue: Story = { args: { value: 3 } };

export const Disabled: Story = { args: { value: 4, disabled: true } };

export const ReadOnly: Story = { args: { value: 4, readOnly: true } };

// Estado controlado, como será usado na aplicação.
export const Interactive: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(0);
    return <StarRating {...args} value={value} onChange={setValue} />;
  },
};
