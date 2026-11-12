import { LoginForm } from '@/features/auth/ui/LoginForm';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const { verified } = await searchParams;

  return (
    <main>
      {verified && (
        <p role="status" className="verified-notice">
          E-mail verificado! Agora é só entrar.
        </p>
      )}
      <LoginForm />
    </main>
  );
}
