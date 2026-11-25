import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { EditRatingModal } from './EditRatingModal';

const meta = {
  title: 'Ratings/EditRatingModal',
  component: EditRatingModal,
  args: {
    open: true,
    rating: {
      value: 4,
      comment: 'Roteiro ótimo, mas o final podia ser mais curto.',
      createdAt: '2026-11-20T12:00:00Z',
    },
    onCancel: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof EditRatingModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Aberto: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement.ownerDocument.body);
    const save = c.getByRole('button', { name: 'Salvar alterações' });
    await expect(save).toBeDisabled(); // nada mudou ainda
    await userEvent.click(c.getByLabelText('5 estrelas'));
    await userEvent.click(save);
    await expect(args.onSave).toHaveBeenCalledWith(
      5,
      'Roteiro ótimo, mas o final podia ser mais curto.',
    );
  },
};

export const Salvando: Story = { args: { saving: true } };
export const Erro: Story = { args: { error: true } };
