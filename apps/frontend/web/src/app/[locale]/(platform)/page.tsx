import Hero from '@/components/home/Hero';
import HomeCategories from '@/components/home/HomeCategories';
import HomePageView from '@/components/home/HomePageView';
import { Spinner } from '@/components/ui/spinner';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="mt-1 text-muted-foreground">
            Explore food by what you&apos;re craving
          </p>
        </div>

        <Suspense fallback={<Spinner />}>
          <HomeCategories />
        </Suspense>
      </section>

      {/* <HomePageView /> */}
    </>
  );
}

