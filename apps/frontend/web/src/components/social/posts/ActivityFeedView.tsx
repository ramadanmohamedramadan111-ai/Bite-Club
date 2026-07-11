'use client';

import { useEffect, useState } from 'react';
import { useInfinitePosts } from '@/hooks/use-infinite-posts';
import { PostCard } from './PostCard';
import { Post } from '@/types/social/posts';
import { Loader2 } from 'lucide-react';

interface PostsResponse {
  posts: Post[];
  nextCursor: string;
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
    if (!observedElement) return;

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
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={setObservedElement} className="py-8 flex justify-center">
        {isFetchingNextPage && (
          <Loader2 className="animate-spin" />
        )}
      </div>
    </div>
  );
}
