import { Redirect } from 'expo-router';

import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { useAuthStore } from '@/stores/auth';

export default function LoginScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Redirect href="/" />;
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}