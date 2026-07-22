'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ImagePlus, X, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { PastOrder } from '@/types/social/orders';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { createPostAction } from '@/actions/feed';

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
  order: PastOrder;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer p-3 transition-colors ${
        selected
          ? 'border-primary bg-primary/5'
          : 'hover:bg-secondary'
      }`}
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
          <Image
            src={order.restaurantImage}
            alt={order.restaurantName}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{order.restaurantName}</p>
          <p className="text-xs text-muted-foreground">
            {formatOrderDate(order.orderedAt)} · {order.totalPrice} EGP
          </p>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {order.items.map((item) => item.name).join(', ')}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function CreatePostPage() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch past orders from backend
  const { data: pastOrders = [], isLoading: isLoadingOrders } = useQuery<PastOrder[]>({
    queryKey: ['pastOrders'],
    queryFn: () => clientFetch<PastOrder[]>('/api/orders'),
  });

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [caption, setCaption] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { execute: createPost, isExecuting: isPosting } = useAction(createPostAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Post shared successfully and is pending review!');
        router.push('/feed');
      } else {
        toast.error(data?.message || 'Failed to share post');
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message || 'Failed to share post');
    },
  });

  const selectedOrder = pastOrders.find((order) => order.id === selectedOrderId);

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
    setPostImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
    setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSubmit = () => {
    if (!selectedOrderId || !caption.trim() || selectedFiles.length === 0) return;

    createPost({
      order_id: Number(selectedOrderId),
      caption: caption || undefined,
      images: selectedFiles,
    });
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/feed">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="mt-1 text-muted-foreground">
            Share a meal from one of your previous orders
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-6">
        <div className="space-y-3">
          <Label>Select a previous order</Label>
          {isLoadingOrders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-primary h-6 w-6" />
            </div>
          ) : pastOrders.length > 0 ? (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {pastOrders.map((order) => (
                <OrderOption
                  key={order.id}
                  order={order}
                  selected={selectedOrderId === order.id}
                  onSelect={() => setSelectedOrderId(order.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground border rounded-lg border-dashed">
              You don&apos;t have any completed orders yet.
            </div>
          )}
        </div>

        {selectedOrder && (
          <Card className="p-3 text-sm">
            <p className="font-medium">{selectedOrder.restaurantName}</p>
            <p className="text-muted-foreground">
              {selectedOrder.restaurantAddress}
            </p>
            <p className="mt-2 text-muted-foreground">
              {selectedOrder.items
                .map((item) => `${item.quantity}x ${item.name}`)
                .join(' · ')}
            </p>
          </Card>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label>Post images</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Add Images
            </Button>
          </div>

          {postImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {postImages.map((image, index) => (
                <Card key={`${image.slice(0, 32)}-${index}`} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Post image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:bg-secondary/50"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-medium">Add more</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-muted-foreground transition-colors hover:bg-secondary/50"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm font-medium">Upload post images</span>
              <span className="text-xs">You can select multiple images</span>
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
          <Label htmlFor="caption">Caption</Label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Share your thoughts about this meal..."
            className="h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {caption.length}/500 characters
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/feed" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={
              !selectedOrderId ||
              !caption.trim() ||
              selectedFiles.length === 0 ||
              isPosting ||
              isLoadingOrders
            }
          >
            {isPosting ? 'Posting...' : 'Share Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}
