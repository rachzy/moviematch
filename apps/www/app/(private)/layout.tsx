import Link from 'next/link';
import { ProtectedRoute } from '@/features/auth/ui/ProtectedRoute';
import { UserMenu } from '@/features/auth/ui/UserMenu';
import { Logo } from '@/shared/ui/Logo';
import { TopNav } from '@/shared/ui/TopNav';

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
        <Link href="/search" className="topbar-brand" aria-label="MovieMatch">
          <Logo size={24} />
        </Link>
        <TopNav />
        <UserMenu />
      </header>
      <main className="private-main">{children}</main>
    </ProtectedRoute>
  );
}
