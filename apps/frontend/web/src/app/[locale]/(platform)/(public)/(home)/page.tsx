import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Hero from '@/components/home/Hero';
import HomeCategories from '@/components/home/HomeCategories';
import TopRestaurants from '@/components/home/TopRestaurants';
import { Spinner } from '@/components/ui/spinner';
import { Suspense } from 'react';
import { LocationAlert } from '@/components/location/location-alert';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const t = await getTranslations('home');
  const cookieStore = await cookies();
  const lat = cookieStore.get('lat')?.value;
  const lng = cookieStore.get('lng')?.value;
  const hasLocation = !!lat && !!lng;

  return (
    <>
      <Hero />
      <LocationAlert initialHasLocation={hasLocation} />
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t('categories')}</h2>
          <p className="mt-1 text-muted-foreground">{t('categoriesDesc')}</p>
        </div>

        <Suspense fallback={<Spinner />}>
          <HomeCategories />
        </Suspense>
      </section>

      <Suspense fallback={<Spinner />}>
        <TopRestaurants />
      </Suspense>

      {/* <HomePageView /> */}
    </>
  );
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('home.title'),
    description: t('home.description'),
  };
}
