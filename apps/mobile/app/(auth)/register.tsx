import { Redirect, useLocalSearchParams } from 'expo-router';

import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { useAuthStore } from '@/stores/auth';

export default function RegisterScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { referrer_code } = useLocalSearchParams<{ referrer_code?: string }>();
  if (isAuthenticated) return <Redirect href="/" />;
  return (
    <AuthShell>
      <RegisterForm referrerCode={referrer_code} />
    </AuthShell>
  );
}