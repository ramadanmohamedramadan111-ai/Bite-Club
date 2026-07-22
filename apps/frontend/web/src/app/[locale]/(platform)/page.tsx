import { getTranslations } from 'next-intl/server';
import Hero from '@/components/home/Hero';
import HomeCategories from '@/components/home/HomeCategories';
import HomePageView from '@/components/home/HomePageView';
import TopRestaurants from '@/components/home/TopRestaurants';
import { Spinner } from '@/components/ui/spinner';
import { Suspense } from 'react';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <>
      <Hero />
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t('categories')}</h2>
          <p className="mt-1 text-muted-foreground">
            {t('categoriesDesc')}
          </p>
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

