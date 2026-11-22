// Ícones do design system (Figma · "Ícones e elementos"). Decorativos: aria-hidden.
type Props = { size?: number };

export function LogoIcon({ size = 28 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
      <rect x="2" y="7" width="24" height="19" rx="4" fill="#60A5FA" />
      <rect x="2" y="2" width="24" height="6" rx="2" fill="#93C5FD" />
      <path d="M11 12.5v8l7-4z" fill="#fff" />
    </svg>
  );
}

function Outline({
  color,
  size = 60,
  children,
}: Props & { color: string; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function MailIcon(props: Props) {
  return (
    <Outline color="#2563EB" {...props}>
      <rect x="6" y="11" width="36" height="26" rx="5" />
      <path d="M8 15l16 12 16-12" />
    </Outline>
  );
}

export function CheckCircleIcon(props: Props) {
  return (
    <Outline color="#22C55E" {...props}>
      <circle cx="24" cy="24" r="19" />
      <path d="M15 25l7 7 12-14" />
    </Outline>
  );
}

export function WarningIcon(props: Props) {
  return (
    <Outline color="#F87171" {...props}>
      <path d="M24 6L44 40H4z" />
      <path d="M24 19v10M24 34v.5" />
    </Outline>
  );
}
