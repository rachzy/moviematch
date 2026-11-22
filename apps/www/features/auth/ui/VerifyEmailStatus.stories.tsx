import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { VerifyEmailStatus } from './VerifyEmailStatus';

const meta = {
  title: 'Auth/VerifyEmailStatus',
  component: VerifyEmailStatus,
} satisfies Meta<typeof VerifyEmailStatus>;
export default meta;
type Story = StoryObj<typeof meta>;

// Sem token na URL. Com token o componente chama a API (ver StatusPanel para os demais estados).
export const InvalidLink: Story = {};
