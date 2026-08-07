import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/ForgetPasswordForm';

export default function page() {
  return (
    <>
      <ForgotPasswordForm />
    </>
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('forgotPassword.title'),
    description: t('forgotPassword.description'),
  };
}
