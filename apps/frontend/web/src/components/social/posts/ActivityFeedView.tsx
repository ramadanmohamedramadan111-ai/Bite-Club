'use client';

import { useEffect, useState } from 'react';
import { useInfinitePosts } from '@/hooks/use-infinite-posts';
import { PostCard } from './PostCard';
import { Post } from '@/types/social/posts';
import { Loader2 } from 'lucide-react';

interface PostsResponse {
  posts: Post[];
  nextCursor?: string;
}

interface ActivityFeedViewProps {
  onAddToCart?: (post: Post) => void;
}

export function ActivityFeedView({ onAddToCart }: ActivityFeedViewProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePosts('/posts');

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

  const posts = data?.pages.flatMap((page: PostsResponse) => page.posts) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onAddToCart={onAddToCart} />
      ))}

      {hasNextPage && (
        <div ref={setObservedElement} className="flex justify-center py-8">
          {isFetchingNextPage && <Loader2 className="animate-spin" />}
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No more posts to load
        </p>
      )}
    </div>
  );
}
