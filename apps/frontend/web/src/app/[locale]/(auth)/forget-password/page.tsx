import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgetPasswordForm';

export default function page() {
  return (
    <>
      <ForgotPasswordForm />
    </>
  );
}



export const metadata: Metadata = {
  title: "Forgot Password | Bite Club",
  description: "Reset your Bite Club account password securely.",
};
