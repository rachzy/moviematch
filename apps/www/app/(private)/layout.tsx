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
        <strong>MovieMatch</strong>
        <LogoutButton />
      </header>
      <main className="private-main">{children}</main>
    </ProtectedRoute>
  );
}
