'use client';

import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import {
  categoryEmojis,
  restaurantCategories,
} from '@/data/restaurant-categories';
import { mockRestaurants } from '@/data/mock-restaurants';

const topRestaurants = [...mockRestaurants]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 5);

export default function HomePageView() {
  return (
    <div className="container mx-auto space-y-12 pb-8">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="mt-1 text-muted-foreground">
            Explore food by what you&apos;re craving
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
          {restaurantCategories.map((category) => (
            <Link
              key={category}
              href={`/restaurants?category=${encodeURIComponent(category)}`}
              className="group flex w-24 flex-col items-center gap-2 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-3xl transition group-hover:bg-primary/20 group-hover:shadow-md">
                {categoryEmojis[category]}
              </div>
              <span className="text-sm font-medium">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Top restaurants</h2>
            <p className="mt-1 text-muted-foreground">
              Highest rated picks near you
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit gap-2">
            <Link href="/restaurants">
              View all restaurants
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {topRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>
    </div>
  );
}

