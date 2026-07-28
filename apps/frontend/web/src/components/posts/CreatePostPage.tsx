'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ImagePlus, X, ShoppingBag } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { createPostAction } from '@/actions/feed';
import type { OrderResponse } from '@/types/order';
import { cn } from '@/lib/utils';

function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function OrderOption({
  order,
  selected,
  onSelect,
}: {
  order: OrderResponse;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer p-4 rounded-2xl border transition-all duration-300 shadow-3xs select-none",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-border/60 bg-background/50 hover:bg-accent/40"
      )}
      onClick={onSelect}>
      <div className="flex gap-4 items-center">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted border border-border flex items-center justify-center">
          <ShoppingBag className="size-6 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-foreground">{order.restaurant.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatOrderDate(order.created_at)} · {order.financials.total} EGP
          </p>
          <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
            {order.items.map((item) => item.item_name).join(', ')}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function CreatePostPage({ orders }: { orders: OrderResponse[] }) {
  const router = useRouter();
  const t = useTranslations('createPost');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { execute: createPost, isExecuting: isPosting } = useAction(
    createPostAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message);
          router.push('/feed');
        } else {
          toast.error(data?.message);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message);
      },
    },
  );

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPostImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setPostImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index),
    );
    setSelectedFiles((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index),
    );
  };

  const handleSubmit = () => {
    if (!selectedOrderId || !caption.trim() || selectedFiles.length === 0)
      return;

    createPost({
      order_id: selectedOrderId,
      caption: caption || undefined,
      images: selectedFiles,
    });
  };

  return (
    <div className="w-full px-4 py-8">
      {/* Header bar */}
      <div className="flex items-center gap-4 border-b border-border/30 pb-6 mb-8">
        <Link href="/feed">
          <Button variant="outline" size="icon" className="rounded-xl border-border bg-background/50 hover:bg-background cursor-pointer h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <Card className="rounded-2xl border border-border bg-card/65 backdrop-blur-md shadow-md p-6 sm:p-8 space-y-6">
        {/* Order selection list */}
        <div className="space-y-2.5">
          <Label className="font-semibold text-sm text-foreground">{t('selectOrder')}</Label>
          {orders.length > 0 ? (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {orders.map((order) => (
                <OrderOption
                  key={order.id}
                  order={order}
                  selected={selectedOrderId === order.id}
                  onSelect={() => setSelectedOrderId(order.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground border rounded-2xl border-dashed border-border/80">
              {t('noOrders')}
            </div>
          )}
        </div>

        {/* Selected order preview badge */}
        {selectedOrder && (
          <Card className="p-4 rounded-xl border border-border/60 bg-muted/25 text-sm">
            <p className="font-bold text-foreground">{selectedOrder.restaurant.name}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {selectedOrder.items
                .map((item) => `${item.quantity}x ${item.item_name}`)
                .join(' · ')}
            </p>
          </Card>
        )}

        {/* Image upload section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="font-semibold text-sm text-foreground">{t('postImages')}</Label>
            {postImages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-xs h-9 cursor-pointer"
                onClick={() => imageInputRef.current?.click()}>
                <ImagePlus className="mr-1.5 h-4 w-4" />
                {t('addImages')}
              </Button>
            )}
          </div>

          {postImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5">
              {postImages.map((image, index) => (
                <Card
                  key={`${image.slice(0, 32)}-${index}`}
                  className="overflow-hidden rounded-xl border border-border relative aspect-square">
                  <Image
                    src={image}
                    alt={t('postImageAlt', { index: index + 1 })}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7 rounded-full shadow-md bg-background/80 hover:bg-background cursor-pointer"
                    onClick={() => removeImage(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 text-muted-foreground transition-all duration-300 hover:bg-secondary/40 hover:border-primary/40 cursor-pointer">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-bold">{t('addMore')}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 p-8 text-muted-foreground transition-all duration-300 hover:bg-secondary/40 hover:border-primary/40 cursor-pointer">
              <ImagePlus className="h-8 w-8 text-muted-foreground/60" />
              <span className="text-sm font-bold text-foreground mt-1">{t('uploadImages')}</span>
              <span className="text-xs text-muted-foreground">{t('selectMultiple')}</span>
            </button>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Caption text area */}
        <div className="space-y-2">
          <Label htmlFor="caption" className="font-semibold text-sm text-foreground">{t('caption')}</Label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t('captionPlaceholder')}
            className="h-28 w-full rounded-xl border border-border bg-background/50 focus-visible:ring-primary/20 px-3 py-2 text-sm leading-relaxed"
          />
          <p className="text-xs text-muted-foreground text-right">
            {t('charCount', { count: caption.length })}
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex items-center gap-3 pt-2">
          <Link href="/feed" className="flex-1">
            <Button variant="outline" className="w-full rounded-xl h-11 font-bold text-sm shadow-3xs cursor-pointer">
              {t('cancel')}
            </Button>
          </Link>
          <Button
            className="flex-1.5 rounded-xl h-11 font-bold text-sm shadow-sm cursor-pointer"
            onClick={handleSubmit}
            disabled={
              !selectedOrderId ||
              !caption.trim() ||
              selectedFiles.length === 0 ||
              isPosting
            }>
            {isPosting ? t('sharing') : t('share')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
