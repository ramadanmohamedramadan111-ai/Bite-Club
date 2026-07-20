'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Clock, Heart, Search } from 'lucide-react';
import type {
  BackendMenuItem,
  MenuItems,
  RestaurantType,
  MenuItem as ClientMenuItem,
} from '@/types/restaurant/restaurant';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import MenuItemDialog from './MenuItemDialog';
import type { OrderingContext } from './MenuItemCustomizer';

type Props = {
  restaurant: RestaurantType;
  menuItems: MenuItems[];
  orderingContext?: OrderingContext;
};

export default function RestaurantDetailMenuClient({
  restaurant,
  menuItems,
  orderingContext = 'restaurant',
}: Props) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ClientMenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter backend categories and their items by search query
  const filteredCategories = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return menuItems;

    return menuItems
      .map((cat) => {
        const matchingItems = cat.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            (item.description &&
              item.description.toLowerCase().includes(query)),
        );
        return {
          ...cat,
          items: matchingItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [menuItems, debouncedSearch]);

  const activeCategoriesList = useMemo(() => {
    return filteredCategories.map((c) => c.title);
  }, [filteredCategories]);

  useEffect(() => {
    if (activeCategory && !activeCategoriesList.includes(activeCategory)) {
      setActiveCategory(activeCategoriesList[0] ?? null);
    } else if (!activeCategory && activeCategoriesList.length > 0) {
      setActiveCategory(activeCategoriesList[0]);
    }
  }, [activeCategory, activeCategoriesList]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    sectionRefs.current[category]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleOpenItem = (item: BackendMenuItem, categoryTitle: string) => {
    // Map backend MenuItem to ClientMenuItem interface for customizer dialog compatibility
    const clientItem: ClientMenuItem = {
      id: item.id,
      name: item.title,
      description: item.description || '',
      price: Number(item.price),
      categories: [categoryTitle],
      likesCount: 0,
      preparationTime: 15,
      available: item.is_available,
      image: item.image_url || '/storage/restaurants/restaurant.jpeg',
      options: [], // Options will be customized in client dialog
      restaurantId: restaurant.id,
    };
    setSelectedItem(clientItem);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="lg:w-56 lg:shrink-0">
          <div className="sticky top-20 space-y-1">
            <div className="relative max-w-md mb-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search menu items..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>

            <div className="rounded-xl border p-2">
              <p className="px-2 py-1 text-sm font-medium">Categories</p>
              {activeCategoriesList.length > 0 ? (
                activeCategoriesList.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => scrollToCategory(category)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-sm transition flex items-center justify-between',
                      activeCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted',
                    )}>
                    <span>{category}</span>
                    <span className="ml-1 text-xs opacity-80">
                      (
                      {filteredCategories.find((c) => c.title === category)
                        ?.items.length ?? 0}
                      )
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-2 py-2 text-sm text-muted-foreground">
                  No categories found
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Menu Items Grid */}
        <div className="min-w-0 flex-1 space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <section
                key={category.id}
                ref={(element) => {
                  sectionRefs.current[category.title] = element;
                }}
                className="scroll-mt-24 space-y-4">
                <h2 className="text-lg font-semibold">{category.title}</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOpenItem(item, category.title)}
                      disabled={!item.is_available}
                      className={cn(
                        'overflow-hidden rounded-xl border text-left transition hover:border-primary/40 hover:shadow-sm',
                        !item.is_available && 'opacity-60',
                      )}>
                      <div className="relative h-36 w-full">
                        <Image
                          // src={item.image_url || '/storage/restaurants/restaurant.jpeg'}
                          src={'/a'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium">{item.title}</h3>
                          <span className="shrink-0 text-sm font-semibold">
                            {item.price.toFixed(2)} EGP
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {item.description || ''}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" />
                            15 min
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium">No menu items found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term.
              </p>
            </div>
          )}
        </div>
      </div>

      <MenuItemDialog
        restaurant={restaurant}
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        orderingContext={orderingContext}
      />
    </div>
  );
}

