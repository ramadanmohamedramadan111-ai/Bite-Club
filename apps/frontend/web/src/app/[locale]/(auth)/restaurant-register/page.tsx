import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RestaurantRegisterForm } from '@/components/auth/RestaurantRegisterForm';
import { ApiResponse } from '@/types/api';
import { RestaurantCategory } from '@/types/restaurant';
import { serverFetch } from '@/utils/server-fetch';

export default async function page() {
  const data = await serverFetch<ApiResponse<{ items: RestaurantCategory[] }>>(
    '/restaurant/categories?all=true',
  );
  const categories = data.data.items;

  return (
    <>
      <RestaurantRegisterForm categories={categories} />
    </>
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('restaurantRegister.title'),
    description: t('restaurantRegister.description'),
  };
}
