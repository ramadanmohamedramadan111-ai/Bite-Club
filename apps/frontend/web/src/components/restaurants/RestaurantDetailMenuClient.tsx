'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import type {
  ClientMenuItem,
  MenuItem,
  MenuItems,
  RestaurantType,
} from '@/types/restaurant';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import MenuItemDialog from './MenuItemDialog';
import type { OrderingContext } from './MenuItemCustomizer';
import { Separator } from '@/components/ui/separator';

type Props = {
  restaurant: RestaurantType;
  menuItems: MenuItems[];
  orderingContext?: OrderingContext;
  isAuthenticated: boolean;
};

export default function RestaurantDetailMenuClient({
  restaurant,
  menuItems,
  orderingContext = 'restaurant',
  isAuthenticated,
}: Props) {
  const t = useTranslations('restaurants');
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

  const handleOpenItem = (item: MenuItem, categoryTitle: string) => {
    // Map backend MenuItem to ClientMenuItem interface for customizer dialog compatibility
    const clientItem: ClientMenuItem = {
      id: item.id,
      name: item.title,
      description: item.description || '',
      price: Number(item.price),
      categories: [categoryTitle],
      likesCount: 0,
      available: item.is_available,
      image: item.image_url || '/storage/restaurants/restaurant.jpeg',
      options: [], // Options will be customized in client dialog
      restaurantId: restaurant.id,
    };
    setSelectedItem(clientItem);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Search menu items input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
              <Input
                type="search"
                placeholder={t('searchMenuItems')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9 h-10 rounded-xl"
              />
            </div>

            {/* Categories sidebar layout similar to Talabat */}
            <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xs p-2 shadow-xs space-y-1">
              <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('categories')}</p>
              {activeCategoriesList.length > 0 ? (
                activeCategoriesList.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => scrollToCategory(category)}
                    className={cn(
                      'w-full rounded-xl px-3 py-2 text-left text-sm transition flex items-center justify-between border-l-4 cursor-pointer',
                      activeCategory === category
                        ? 'bg-primary/10 text-primary border-primary font-bold'
                        : 'hover:bg-accent/40 text-muted-foreground hover:text-foreground border-transparent',
                    )}>
                    <span>{category}</span>
                    <span className="ml-1 text-xs opacity-75">
                      (
                      {filteredCategories.find((c) => c.title === category)
                        ?.items.length ?? 0}
                      )
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  {t('noCategoriesFound')}
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
                <h2 className="text-xl font-bold tracking-tight text-foreground px-1">{category.title}</h2>

                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleOpenItem(item, category.title)}
                      disabled={!item.is_available}
                      className={cn(
                        'flex items-stretch justify-between overflow-hidden rounded-2xl border border-border/40 bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-md w-full gap-4 group cursor-pointer',
                        !item.is_available && 'opacity-55',
                      )}>
                      {/* Left Side: Info */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-tight">{item.title}</h3>
                          <p className="line-clamp-2 text-xs md:text-sm text-muted-foreground/85 mt-1 leading-normal">
                            {item.description || ''}
                          </p>
                        </div>
                        <div className="pt-2">
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            {item.price.toFixed(2)} EGP
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Square Image container with overlapping add button */}
                      <div className="relative size-24 sm:size-28 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/30">
                        <Image
                          src={item.image_url || '/storage/restaurants/restaurant.jpeg'}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Floating Add Plus Overlay like Talabat */}
                        <div className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-transform duration-150 group-hover:scale-110">
                          <span className="text-lg font-bold leading-none">+</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-8 text-center bg-card/40">
              <p className="font-bold">{t('noMenuItems')}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('tryDifferentSearch')}
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
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
