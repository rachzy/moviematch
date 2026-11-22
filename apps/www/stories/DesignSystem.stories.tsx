import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  CheckCircleIcon,
  LogoIcon,
  MailIcon,
  WarningIcon,
} from '../features/auth/ui/icons';

// Tokens definidos em shared/styles/base.css (:root).
const TOKENS = [
  'bg',
  'surface',
  'surface-hover',
  'border',
  'focus',
  'error',
  'error-bg',
  'primary',
  'primary-hover',
  'link-dark',
  'stars',
  'success',
  'text',
  'text-primary',
  'text-secondary',
  'text-support',
];

const meta = {
  title: 'Design System/Foundations',
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 150px)',
        gap: 12,
      }}
    >
      {TOKENS.map((t) => (
        <div
          key={t}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 56, background: `var(--${t})` }} />
          <code style={{ display: 'block', padding: 8, fontSize: 12 }}>
            --{t}
          </code>
        </div>
      ))}
    </div>
  ),
};

export const Buttons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <button className="btn btn-primary">Primário</button>
      <button className="btn btn-primary" disabled>
        Desabilitado
      </button>
      <button className="btn btn-secondary">Secundário</button>
      <button className="btn-primary" style={{ width: 160 }}>
        <span className="btn-spinner" aria-hidden="true" />
        Carregando…
      </button>
      <button className="btn-link">Botão de texto</button>
    </div>
  ),
};

export const Inputs: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 320 }}>
      <input className="text-input" placeholder="Padrão" />
      <input
        className="text-input input-error"
        placeholder="Com erro"
        aria-invalid
      />
      <div className="error-banner" role="alert">
        Mensagem de erro
      </div>
    </div>
  ),
};

export const Icons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <LogoIcon size={48} />
      <MailIcon />
      <CheckCircleIcon />
      <WarningIcon />
    </div>
  ),
};
