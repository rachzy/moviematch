import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { LogoutModal } from './LogoutModal';

const meta = {
  title: 'Auth/LogoutModal',
  component: LogoutModal,
  args: { open: true, onCancel: fn(), onConfirm: fn() },
} satisfies Meta<typeof LogoutModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

// Fecha de verdade ao cancelar/confirmar, como na aplicação.
export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          Sair
        </button>
        <LogoutModal
          open={open}
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};
