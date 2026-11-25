// Logo do MovieMatch (design do Figma): dois quadros de filme entrelaçados
// com uma estrela no meio, ao lado do nome "MovieMatch".
export function LogoMark({ size = 32 }: { size?: number }) {
  const frame = (x: number, cx: number, color: string) => (
    <>
      <rect
        x={x}
        y="7"
        width="18"
        height="18"
        rx="3.5"
        transform={`rotate(45 ${cx} 16)`}
        stroke={color}
        strokeWidth="3.6"
      />
      {/* furinhos da película */}
      <rect
        x={x}
        y="7"
        width="18"
        height="18"
        rx="3.5"
        transform={`rotate(45 ${cx} 16)`}
        stroke="#111827"
        strokeWidth="1"
        strokeDasharray="1.2 2"
      />
    </>
  );
  return (
    <svg
      width={(size * 3) / 2}
      height={size}
      viewBox="0 0 48 32"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="logo-cross">
          <rect x="17" y="16" width="14" height="16" />
        </clipPath>
      </defs>
      {frame(10, 19, '#3459CC')}
      {frame(20, 29, '#48A8FC')}
      {/* o quadro escuro passa por cima no cruzamento de baixo */}
      <g clipPath="url(#logo-cross)">{frame(10, 19, '#3459CC')}</g>
      <path
        d="M24 12.2c.4 2.3 1 3.4 3.4 3.8-2.4.4-3 1.5-3.4 3.8-.4-2.3-1-3.4-3.4-3.8 2.4-.4 3-1.5 3.4-3.8z"
        fill="#fff"
      />
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span>
        Movie<b>Match</b>
      </span>
    </span>
  );
}
