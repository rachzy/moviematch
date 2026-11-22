import { AuthLayout } from '@/features/auth/ui/AuthLayout';
import { VerifyCode } from '@/features/auth/ui/VerifyCode';

export default function VerifyPage() {
  return (
    <AuthLayout>
      <VerifyCode />
    </AuthLayout>
  );
}
