import { Redirect } from 'expo-router';

import { AuthShell } from '@/components/auth/auth-shell';
import { RestaurantRegisterForm } from '@/components/auth/restaurant-register-form';
import { useAuthStore } from '@/stores/auth';

export default function RestaurantRegisterScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Redirect href="/" />;
  return (
    <AuthShell>
      <RestaurantRegisterForm />
    </AuthShell>
  );
}