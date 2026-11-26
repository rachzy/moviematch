import Link from 'next/link';
import { ProtectedRoute } from '@/features/auth/ui/ProtectedRoute';
import { LogoutButton } from '@/features/auth/ui/LogoutButton';

// Tudo dentro de app/(private)/ fica protegido automaticamente.
// O "(private)" é só um agrupamento de pasta: NÃO aparece na URL.
export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <header className="topbar">
        <nav className="topnav">
          <strong>
            Movie<span className="brand-accent">Match</span>
          </strong>
          <Link href="/search">Buscar</Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="private-main">{children}</main>
    </ProtectedRoute>
  );
}
