import { VerifyEmailStatus } from '@/features/auth/ui/VerifyEmailStatus';

// o token vai na query; não repassa a URL no header Referer
export const metadata = { referrer: 'no-referrer' as const };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main>
      <VerifyEmailStatus token={token} />
    </main>
  );
}
