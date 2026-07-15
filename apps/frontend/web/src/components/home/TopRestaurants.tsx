import React from 'react';
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';

export default async function TopRestaurants() {
  return (
    <section className="space-y-6">
      {/* <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
        </div> */}
    </section>
  );
}

