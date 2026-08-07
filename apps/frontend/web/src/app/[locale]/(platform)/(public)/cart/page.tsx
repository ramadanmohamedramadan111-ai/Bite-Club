import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import CartPageView from '@/components/cart/CartPageView';

export default function CartPage() {
  return <CartPageView />;
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('cart.title'),
    description: t('cart.description'),
  };
}
