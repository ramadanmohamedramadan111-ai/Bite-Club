'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Clock, Minus, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAction } from 'next-safe-action/hooks';
import { addItemToGroupOrderSessionAction } from '@/actions/group-order';
import { useRouter } from '@/i18n/navigation';
import type { MenuItems as MenuItemsType } from '@/types/restaurant';

type Props = {
  sessionId: number;
  menuGroups: MenuItemsType[];
};

type SelectedItem = {
  id: number;
  title: string;
  price: number;
  description: string;
  image_url: string | null;
  is_available: boolean;
};

export default function GroupOrderMenuItems({ sessionId, menuGroups }: Props) {
  const t = useTranslations('restaurants');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredCategories = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return menuGroups;

    return menuGroups
      .map((cat) => {
        const matchingItems = cat.items.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            (item.description &&
              item.description.toLowerCase().includes(query)),
        );
        return { ...cat, items: matchingItems };
      })
      .filter((cat) => cat.items.length > 0);
  }, [menuGroups, debouncedSearch]);

  const activeCategoriesList = useMemo(
    () => filteredCategories.map((c) => c.title),
    [filteredCategories],
  );

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

  const total = useMemo(
    () => (selectedItem?.price ?? 0) * quantity,
    [selectedItem, quantity],
  );

  const { execute: addItem, isExecuting } = useAction(
    addItemToGroupOrderSessionAction,
    {
      onSuccess: () => {
        toast.success('Item added to group order');
        setDialogOpen(false);
        setQuantity(1);
        setNotes('');
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message ?? 'Failed to add item');
      },
    },
  );

  function openDialog(item: SelectedItem) {
    setSelectedItem(item);
    setQuantity(1);
    setNotes('');
    setDialogOpen(true);
  }

  function handleAdd() {
    if (!selectedItem) return;
    addItem({
      group_order_id: sessionId,
      item_id: selectedItem.id,
      quantity,
      notes,
    });
  }

  const disabledConditions = isExecuting || !selectedItem?.is_available;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="sticky top-20 space-y-1">
            <div className="relative max-w-md mb-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchMenuItems')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>

            <div className="rounded-xl border p-2">
              <p className="px-2 py-1 text-sm font-medium">{t('categories')}</p>
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
                  {t('noCategoriesFound')}
                </p>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <section
                key={category.id}
                ref={(el) => {
                  sectionRefs.current[category.title] = el;
                }}
                className="scroll-mt-24 space-y-4">
                <h2 className="text-lg font-semibold">{category.title}</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        openDialog({
                          id: item.id,
                          title: item.title,
                          price: item.price,
                          description: item.description,
                          image_url: item.image_url,
                          is_available: item.is_available,
                        })
                      }
                      disabled={!item.is_available}
                      className={cn(
                        'overflow-hidden rounded-xl border text-left transition hover:border-primary/40 hover:shadow-sm',
                        !item.is_available && 'opacity-60',
                      )}>
                      <div className="relative h-36 w-full">
                        <Image
                          src={
                            item.image_url ||
                            '/storage/restaurants/restaurant.jpeg'
                          }
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
                            {t('deliveryTime', { time: 15 })}
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
              <p className="font-medium">{t('noMenuItems')}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('tryDifferentSearch')}
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="relative h-44 overflow-hidden rounded-xl">
              <Image
                src={
                  selectedItem?.image_url ||
                  '/storage/restaurants/restaurant.jpeg'
                }
                alt={selectedItem?.title ?? ''}
                fill
                className="object-cover"
              />
              {selectedItem && !selectedItem.is_available && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-background px-4 py-2 text-sm font-medium">
                    {t('currentlyUnavailable')}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">{selectedItem?.title}</h2>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {selectedItem?.price.toFixed(2)} EGP
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedItem?.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('prepTime', { time: 15 })}
              </p>
            </div>

            <Separator />

            <div className="space-y-5">
              <div>
                <Field>
                  <FieldLabel htmlFor="instructions">
                    {t('specialInstructions')}
                  </FieldLabel>
                  <Input
                    id="instructions"
                    type="text"
                    placeholder={t('specialInstructionsPlaceholder')}
                    value={notes}
                    disabled={disabledConditions}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </Field>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 rounded-lg border p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={quantity <= 1 || disabledConditions}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }>
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabledConditions}
                  onClick={() => setQuantity((current) => current + 1)}>
                  <Plus className="size-4" />
                </Button>
              </div>

              <Button
                type="button"
                className="flex-1"
                disabled={disabledConditions}
                onClick={handleAdd}>
                {t('addToCart', { total: total.toFixed(2) })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

