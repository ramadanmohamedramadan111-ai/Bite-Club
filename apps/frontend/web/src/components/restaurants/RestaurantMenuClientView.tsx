'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Clock, Heart, Search } from 'lucide-react';
import type { MenuItem, RestaurantType } from '@/types/restaurant/restaurant';

import { getMenuCategories } from '@/data/restaurant-details';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import MenuItemDialog from './MenuItemDialog';
import type { OrderingContext } from './MenuItemCustomizer';

type Props = {
  restaurant: RestaurantType;
  items: MenuItem[];
  orderingContext?: OrderingContext;
};

function itemMatchesSearch(item: MenuItem, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    item.name.toLowerCase().includes(normalized) ||
    item.description.toLowerCase().includes(normalized) ||
    item.categories.some((category) =>
      category.toLowerCase().includes(normalized),
    )
  );
}

export default function RestaurantMenuClientView({
  restaurant,
  items,
  orderingContext = 'restaurant',
}: Props) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredItems = useMemo(
    () => items.filter((item) => itemMatchesSearch(item, debouncedSearch)),
    [items, debouncedSearch],
  );

  const visibleCategories = useMemo(() => {
    return getMenuCategories(filteredItems);
  }, [filteredItems]);

  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};

    visibleCategories.forEach((category) => {
      grouped[category] = filteredItems.filter((item) =>
        item.categories.includes(category),
      );
    });

    return grouped;
  }, [filteredItems, visibleCategories]);

  useEffect(() => {
    if (activeCategory && !visibleCategories.includes(activeCategory)) {
      setActiveCategory(visibleCategories[0] ?? null);
    }
  }, [activeCategory, visibleCategories]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    sectionRefs.current[category]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const openItemDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
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
              {visibleCategories.length > 0 ? (
                visibleCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => scrollToCategory(category)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-sm transition',
                      activeCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted',
                    )}>
                    {category}
                    <span className="ml-1 text-xs opacity-80">
                      ({itemsByCategory[category]?.length ?? 0})
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

        <div className="min-w-0 flex-1 space-y-8">
          {visibleCategories.length > 0 ? (
            visibleCategories.map((category) => (
              <section
                key={category}
                ref={(element) => {
                  sectionRefs.current[category] = element;
                }}
                className="scroll-mt-24 space-y-4">
                <h2 className="text-lg font-semibold">{category}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {itemsByCategory[category]?.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openItemDialog(item)}
                      disabled={!item.available}
                      className={cn(
                        'overflow-hidden rounded-xl border text-left transition hover:border-primary/40 hover:shadow-sm',
                        !item.available && 'opacity-60',
                      )}>
                      <div className="relative h-36 w-full">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <span className="shrink-0 text-sm font-semibold">
                            {item.price.toFixed(2)} EGP
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {item.preparationTime} min
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Heart className="size-3.5" />
                            {item.likesCount}
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
        restaurant={restaurant as any}
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        orderingContext={orderingContext}
      />
    </div>
  );
}
