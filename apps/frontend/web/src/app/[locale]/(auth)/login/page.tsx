import type { Metadata } from 'next';
import LoginTabs from '@/components/auth/LoginTabs';

export default function Page() {
  return (
    <>
      <LoginTabs />
    </>
  );
}



export const metadata: Metadata = {
  title: "Login | Bite Club",
  description: "Access your Bite Club account to order delicious meals from local restaurants and check on active group order sessions.",
};
