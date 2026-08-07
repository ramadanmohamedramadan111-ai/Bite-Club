import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const queryString = new URLSearchParams(sp as Record<string, string>).toString();
  const dest = `/points${queryString ? `?${queryString}` : ''}`;
  
  redirect({ href: dest, locale });
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('pointsHistory.title'),
    description: t('pointsHistory.description'),
  };
}
