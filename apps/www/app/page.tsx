import { AuthLayout } from '@/features/auth/ui/AuthLayout';
import { LoginForm } from '@/features/auth/ui/LoginForm';

export default function Home() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
