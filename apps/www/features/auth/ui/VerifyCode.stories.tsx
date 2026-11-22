import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { VerifyCode } from './VerifyCode';

const meta = {
  title: 'Auth/VerifyCode',
  component: VerifyCode,
} satisfies Meta<typeof VerifyCode>;
export default meta;
type Story = StoryObj<typeof meta>;

// O e-mail do cadastro vem do sessionStorage (ver pendingEmail.ts).
export const WithEmail: Story = {
  beforeEach: () => {
    sessionStorage.setItem('pendingEmail', 'ana@email.com');
    return () => sessionStorage.removeItem('pendingEmail');
  },
};

export const WithoutEmail: Story = {
  beforeEach: () => sessionStorage.removeItem('pendingEmail'),
};
