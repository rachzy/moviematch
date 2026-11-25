import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Logo, LogoMark } from './Logo';

const meta = {
  title: 'Shared/Logo',
  component: Logo,
} satisfies Meta<typeof Logo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ComNome: Story = {};
export const Grande: Story = { args: { size: 64 } };
export const SoOSimbolo: Story = { render: () => <LogoMark size={48} /> };
