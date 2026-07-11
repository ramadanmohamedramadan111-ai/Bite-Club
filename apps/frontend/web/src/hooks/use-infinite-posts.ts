'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { Post } from '@/types/social/posts';

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
      const limit = 10;

      const response = await clientFetch<PostsResponse>(
        `${endpoint}?offset=${offset}&limit=${limit}`,
        'GET',
      );

      return {
        posts: response.posts,
        nextCursor: response.nextCursor || (offset + limit).toString(),
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
    initialPageParam: '0',
    enabled,
  });
}

export function useUserPosts(userId: string, enabled: boolean = true) {
  return useInfinitePosts(`/users/${userId}/posts`, enabled);
}
