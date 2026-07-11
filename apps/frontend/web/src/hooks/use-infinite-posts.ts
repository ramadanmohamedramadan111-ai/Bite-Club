'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { Post } from '@/types/social/posts';

const PAGE_SIZE = 10;

interface PostsResponse {
  posts: Post[];
  nextCursor?: string;
}

export function useInfinitePosts(
  endpoint: string = '/posts',
  enabled: boolean = true,
) {
  return useInfiniteQuery({
    queryKey: [endpoint],
    queryFn: async ({ pageParam }: { pageParam: string }) => {
      const offset = parseInt(pageParam) || 0;

      const response = await clientFetch<PostsResponse>(
        `${endpoint}?offset=${offset}&limit=${PAGE_SIZE}`,
        'GET',
      );

      const hasMore = response.posts.length >= PAGE_SIZE;

      return {
        posts: response.posts,
        nextCursor: hasMore
          ? response.nextCursor || (offset + PAGE_SIZE).toString()
          : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: '0',
    enabled,
  });
}

export function useUserPosts(userId: string, enabled: boolean = true) {
  return useInfinitePosts(`/users/${userId}/posts`, enabled);
}
