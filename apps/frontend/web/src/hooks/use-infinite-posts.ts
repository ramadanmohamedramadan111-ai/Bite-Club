'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { PostType } from '@/types/social/posts';

const PAGE_SIZE = 10;

interface InfinitePostsResult {
  posts: PostType[];
  nextCursor?: string;
}

export function useInfinitePosts(
  endpoint: string = '/api/posts',
  enabled: boolean = true,
) {
  return useInfiniteQuery({
    queryKey: [endpoint],
    queryFn: async ({ pageParam }: { pageParam: string }) => {
      const offset = parseInt(pageParam) || 0;

      const response = await clientFetch<ApiResponse<PaginatedResponse<PostType>>>(
        `${endpoint}?offset=${offset}&limit=${PAGE_SIZE}`,
        'GET',
      );

      const items = response.data?.items || [];
      const meta = response.data?.meta;
      const hasMore = meta ? meta.current_page < meta.last_page : false;

      return {
        posts: items,
        nextCursor: hasMore
          ? (offset + PAGE_SIZE).toString()
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
