'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// `also`: outras rotas em que o link fica destacado (a página do filme é parte da busca).
const LINKS = [
  { href: '/matches', label: 'Início', also: [] },
  { href: '/search', label: 'Buscar', also: ['/movies'] },
];

// Navegação da área logada; o link da página atual fica destacado.
export function TopNav() {
  const path = usePathname();
  return (
    <nav className="topnav" aria-label="Principal">
      {LINKS.map(({ href, label, also }) => (
        <Link
          key={href}
          href={href}
          aria-current={
            [href, ...also].some((p) => path.startsWith(p)) ? 'page' : undefined
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
