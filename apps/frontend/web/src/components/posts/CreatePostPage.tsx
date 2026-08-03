'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { createPostAction } from '@/actions/feed';
import type { OrderResponse } from '@/types/order';
import { getMediaUrl } from '@/lib/utils';

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
      className={`cursor-pointer p-4 transition-all duration-200 border ${
        selected
          ? 'border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/20 rounded-2xl'
          : 'border-border/40 bg-card hover:bg-accent/40 hover:border-border/70 rounded-2xl'
      }`}
      onClick={onSelect}>
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 font-bold text-primary text-sm uppercase">
          {order.restaurant.logo_url ? (
            <Image
              src={getMediaUrl(order.restaurant.logo_url)!}
              alt={order.restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            order.restaurant.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-bold text-sm sm:text-base text-foreground leading-tight">
            {order.restaurant.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatOrderDate(order.created_at)} ·{' '}
            <span className="font-bold text-foreground/80">
              {order.financials.total} EGP
            </span>
          </p>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
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
          router.push('/posts');
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
    <div className="container mx-auto space-y-8 py-6">
      <div className="flex items-center gap-4">
        <Link href="/posts">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl border border-border/40 hover:bg-accent/40">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <Card className="mx-auto max-w-xl p-6 sm:p-8 space-y-6 border border-border/40 shadow-md bg-card/60 backdrop-blur-md rounded-3xl">
        <div className="space-y-3">
          <Label className="font-bold text-foreground/90">
            {t('selectOrder')}
          </Label>
          {orders.length > 0 ? (
            <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
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
            <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-muted/20">
              {t('noOrders')}
            </div>
          )}
        </div>

        {selectedOrder && (
          <Card className="p-4 text-sm border-primary/20 bg-primary/5 rounded-2xl">
            <p className="font-bold text-foreground">
              {selectedOrder.restaurant.name}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {selectedOrder.items
                .map((item) => `${item.quantity}x ${item.item_name}`)
                .join(' · ')}
            </p>
          </Card>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="font-bold text-foreground/90">
              {t('postImages')}
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-border/40 hover:bg-accent/40"
              onClick={() => imageInputRef.current?.click()}>
              <ImagePlus className="mr-2 h-4 w-4" />
              {t('addImages')}
            </Button>
          </div>

          {postImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {postImages.map((image, index) => (
                <Card
                  key={`${image.slice(0, 32)}-${index}`}
                  className="overflow-hidden rounded-2xl border border-border/40 shadow-xs">
                  <div className="relative aspect-square">
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
                      className="absolute right-2 top-2 h-7 w-7 rounded-full shadow-md backdrop-blur-md bg-background/80 hover:bg-background"
                      onClick={() => removeImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 text-muted-foreground transition-all duration-200 hover:bg-accent/40 hover:border-primary/30 cursor-pointer">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-semibold">{t('addMore')}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-border/60 p-8 text-muted-foreground transition-all duration-200 hover:bg-accent/40 hover:border-primary/30 cursor-pointer">
              <ImagePlus className="h-8 w-8 text-muted-foreground/80" />
              <span className="text-sm font-semibold text-foreground/80">
                {t('uploadImages')}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('selectMultiple')}
              </span>
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

        <div className="space-y-2">
          <Label htmlFor="caption" className="font-bold text-foreground/90">
            {t('caption')}
          </Label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t('captionPlaceholder')}
            className="min-h-[110px] w-full rounded-2xl border border-border/40 bg-background/50 px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus:border-primary/45"
          />
          <p className="text-xs text-muted-foreground text-right">
            {t('charCount', { count: caption.length })}
          </p>
        </div>

        <div className="flex gap-3.5 pt-2">
          <Link href="/posts" className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-xl border-border/40 hover:bg-accent/40 font-semibold">
              {t('cancel')}
            </Button>
          </Link>
          <Button
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary hover:to-orange-600 border-0 text-white font-bold shadow-md shadow-primary/10"
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

