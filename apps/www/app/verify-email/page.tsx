import { VerifyEmailStatus } from '@/features/auth/ui/VerifyEmailStatus';

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
