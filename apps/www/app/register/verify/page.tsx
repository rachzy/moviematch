import { CheckEmailNotice } from '@/features/auth/ui/CheckEmailNotice';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main>
      <CheckEmailNotice email={email} />
    </main>
  );
}
