import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LoginTabs from '@/components/auth/LoginTabs';

export default function Page() {
  return (
    <>
      <LoginTabs />
    </>
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('login.title'),
    description: t('login.description'),
  };
}
