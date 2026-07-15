import { Link } from '@/i18n/navigation';
import { ApiResponse } from '@/types/api/api-response';
import { RestaurantCategory } from '@/types/restaurant/restaurant';
import { serverFetch } from '@/utils/server-fetch';

export default async function HomeCategories() {
  const data = await serverFetch<ApiResponse<{ items: RestaurantCategory[] }>>(
    '/restaurant/categories?all=true',
  );
  const categories = data.data.items;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Categories</h2>
        <p className="mt-1 text-muted-foreground">
          Explore food by what you&apos;re craving
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/restaurants?category=${encodeURIComponent(category.slug)}`}
            className="group flex w-24 flex-col items-center gap-2 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-3xl transition group-hover:bg-primary/20 group-hover:shadow-md">
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

