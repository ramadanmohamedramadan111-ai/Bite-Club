'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { PostCard } from './PostCard';
import { Loader2 } from 'lucide-react';
import type { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import type { PostType } from '@/types/social/posts';

const POSTS_PER_PAGE = 10;

export function UserPostsSection() {
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPosts,
  } = useInfiniteQuery({
    queryKey: ['user-posts'],
    queryFn: async ({ pageParam }) => {
      const res = await clientFetch<ApiResponse<PaginatedResponse<PostType>>>(
        `/api/user/posts?per_page=${POSTS_PER_PAGE}&page=${pageParam}`,
      );
      return res.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const [observedElement, setObservedElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observedElement || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [observedElement, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = postsData?.pages.flatMap((page) => page.items) ?? [];

  if (isLoadingPosts) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={setObservedElement} className="flex justify-center py-8">
          {isFetchingNextPage && <Loader2 className="animate-spin" />}
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No more posts to load
        </p>
      )}
    </div>
  );
}
