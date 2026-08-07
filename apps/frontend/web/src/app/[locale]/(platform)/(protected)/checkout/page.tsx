import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSavedLocation } from '@/components/location/utils';
import CheckoutView from '@/components/checkout/CheckoutView';

export default async function CheckoutPage() {
  const initialLocation = await getSavedLocation();

  return <CheckoutView initialLocation={initialLocation} />;
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('checkout.title'),
    description: t('checkout.description'),
  };
}
