   import { EmailCodeForm } from '@/features/auth/ui/EmailCodeForm';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main>
     <EmailCodeForm email={email} />    </main>
  );
}
