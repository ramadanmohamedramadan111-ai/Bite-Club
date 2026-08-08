'use client';

import { useEffect, useState } from 'react';
import { useInfinitePosts } from '@/hooks/use-infinite-posts';
import { PostCard } from './PostCard';
import { PostType } from '@/types/posts';
import { Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useCopyPostOrder } from '@/hooks/use-copy-post-order';

export default function PostsFeed() {
  const tc = useTranslations('common');
  const { handleAddToCart, confirmDialog } = useCopyPostOrder();
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

  const posts =
    data?.pages.flatMap((page: { posts: PostType[] }) => page.posts) ?? [];

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

      {confirmDialog}

      {!hasNextPage && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tc('reachedEndOfFeed')}
        </p>
      )}
    </div>
  );
}

