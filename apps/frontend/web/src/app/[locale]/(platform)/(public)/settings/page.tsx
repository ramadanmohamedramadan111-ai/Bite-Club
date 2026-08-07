import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import SettingsPageView from '@/components/settings/SettingsPageView';

export default function SettingsPage() {
  return <SettingsPageView />;
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('settings.title'),
    description: t('settings.description'),
  };
}
