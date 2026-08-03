'use client';

import { useEffect, useState } from 'react';
import { useInfinitePosts } from '@/hooks/use-infinite-posts';
import { PostCard } from './PostCard';
import { PostType } from '@/types/posts';
import { Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { useAction } from 'next-safe-action/hooks';
import { copyOrderAction } from '@/actions/feed';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart';
import ConfirmDialog from '@/components/shared/ConfirmationDialog';

export default function PostsFeed() {
  const router = useRouter();
  const tc = useTranslations('common');
  const tCustomizer = useTranslations('restaurants');
  const [replaceCartDialogOpen, setReplaceCartDialogOpen] = useState(false);
  const [selectedPostToCopy, setSelectedPostToCopy] = useState<PostType | null>(null);
  const cart = useCartStore((state) => state.cart);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
  } = useInfinitePosts('/api/posts');

  const [observedElement, setObservedElement] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    if (!observedElement || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [observedElement, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page: any) => page.posts) ?? [];

  const { execute: copyOrder, isExecuting: isCopying } = useAction(
    copyOrderAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message || tc('copySuccess'));
          router.push('/cart');
        } else {
          toast.error(data?.message || tc('copyFailed'));
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError?.message || tc('copyFailed'));
      },
    },
  );

  const handleAddToCart = (post: PostType) => {
    if (cart && cart.restaurant.id !== post.restaurant.id) {
      setSelectedPostToCopy(post);
      setReplaceCartDialogOpen(true);
      return;
    }
    copyOrder(Number(post.id));
  };

  if (isLoadingPosts) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{tc('loadingPosts')}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-16 text-center">
        <p className="text-muted-foreground">{tc('noPostsFeed')}</p>
        <Link href="/posts/create" className="mt-4 inline-block">
          <Button variant="outline">{tc('shareFirstMeal')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onAddToCart={handleAddToCart} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        {hasNextPage && (
          <div ref={setObservedElement}>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {selectedPostToCopy && (
        <ConfirmDialog
          open={replaceCartDialogOpen}
          onOpenChange={setReplaceCartDialogOpen}
          title={tCustomizer('copyOrderTitle')}
          description={tCustomizer('copyOrderDesc', {
            current: cart?.restaurant.name || '',
            new: selectedPostToCopy.restaurant.name,
          })}
          confirmText={tCustomizer('copyOrder')}
          cancelText={tCustomizer('keepCurrentCart')}
          onConfirm={() => {
            copyOrder(Number(selectedPostToCopy.id));
            setReplaceCartDialogOpen(false);
          }}
        />
      )}

      {!hasNextPage && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tc('reachedEndOfFeed')}
        </p>
      )}
    </div>
  );
}

