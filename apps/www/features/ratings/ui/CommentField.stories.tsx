import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { CommentField } from './CommentField';
import './ratings.css';

const meta = {
  title: 'Ratings/CommentField',
  component: CommentField,
  args: { value: '', onChange: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {};
export const Preenchido: Story = {
  args: { value: 'Fotografia linda e um final que me pegou de surpresa.' },
};
export const Desabilitado: Story = {
  args: { value: 'Enviando este comentário…', disabled: true },
};
export const Interativo: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('');
    return <CommentField {...args} value={value} onChange={setValue} />;
  },
};
