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

export default function PostsFeed() {
  const router = useRouter();
  const tc = useTranslations('common');

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
        <Link href="/feed/create" className="mt-4 inline-block">
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

      {hasNextPage && (
        <div ref={setObservedElement} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
        </div>
      )}

      {!hasNextPage && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tc('reachedEndOfFeed')}
        </p>
      )}
    </div>
  );
}

