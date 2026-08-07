import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LegalPageView from '@/components/legal/LegalPageView';

export default function TermsOfServicePage() {
  return <LegalPageView namespace="terms" />;
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('termsOfService.title'),
    description: t('termsOfService.description'),
  };
}
