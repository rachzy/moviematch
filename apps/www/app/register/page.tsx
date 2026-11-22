import { AuthLayout } from '@/features/auth/ui/AuthLayout';
import { RegisterForm } from '@/features/auth/ui/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
