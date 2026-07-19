import { Link } from '@/i18n/navigation';
import { ApiResponse } from '@/types/api/api-response';
import { RestaurantCategory } from '@/types/restaurant/restaurant';
import { serverFetch } from '@/utils/server-fetch';
import { Utensils } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import HomeCategoriesScroll from './HomeCategoriesScroll';

export default async function HomeCategories() {
  const data = await serverFetch<ApiResponse<{ items: RestaurantCategory[] }>>(
    '/user/restaurant-categories',
  );

  const categories = data.data.items;

  // return <HomeCategoriesScroll categories={categories} />;

  return (
    <ScrollArea className="w-full">
      <div className="flex w-max gap-6 pb-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/restaurants?category=${encodeURIComponent(category.slug)}`}
            className="group flex w-24 shrink-0 flex-col items-center text-center">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 transition group-hover:bg-primary/20 group-hover:shadow-md">
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Utensils className="size-8 text-primary" />
              )}
            </div>

            <span className="mt-2 w-full break-words text-sm font-medium leading-tight">
              {category.name}
            </span>
          </Link>
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

