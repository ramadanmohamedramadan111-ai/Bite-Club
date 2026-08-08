import { Link } from '@/i18n/navigation';
import { ApiResponse } from '@/types/api';
import { RestaurantCategory } from '@/types/restaurant';
import { serverFetch } from '@/utils/server-fetch';
import { getLocale } from 'next-intl/server';
import { getLangDir } from 'rtl-detect';
import { Utensils } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default async function HomeCategories() {
  const data = await serverFetch<ApiResponse<{ items: RestaurantCategory[] }>>(
    '/user/restaurant-categories',
  );

  const locale = await getLocale();
  const direction = getLangDir(locale);

  const categories = data.data.items;

  return (
    <div className="overflow-x-hidden w-full">
      <ScrollArea dir={direction} className="w-full">
        {/* Changed flex-wrap to flex w-max to support clean horizontal slider scrolling */}
        <div className="flex w-max gap-6 pb-4 px-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/restaurants?category=${category.name}`}
              className="group flex w-20 sm:w-24 shrink-0 flex-col items-center text-center cursor-pointer">
              <div className="flex size-16 sm:size-20 items-center justify-center overflow-hidden rounded-full bg-accent/45 border border-border/40 transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:scale-105 shadow-xs group-hover:shadow-md">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Utensils className="size-6 sm:size-8 text-primary/80 group-hover:text-primary transition-colors" />
                )}
              </div>

              <span className="mt-2.5 w-full break-words text-xs sm:text-sm font-semibold leading-tight text-muted-foreground/90 group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
