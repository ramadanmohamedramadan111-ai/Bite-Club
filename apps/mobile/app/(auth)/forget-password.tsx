import { Redirect } from 'expo-router';

import { AuthShell } from '@/components/auth/auth-shell';
import { ForgetPasswordForm } from '@/components/auth/forget-password-form';
import { useAuthStore } from '@/stores/auth';

export default function ForgetPasswordScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Redirect href="/" />;
  return (
    <AuthShell>
      <ForgetPasswordForm />
    </AuthShell>
  );
}