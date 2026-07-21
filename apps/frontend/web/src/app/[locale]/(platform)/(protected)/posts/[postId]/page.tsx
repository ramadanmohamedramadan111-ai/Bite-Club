'use client';

import { PostDetailPage } from '@/components/social/posts/PostDetailPage';
import { useEffect, useState, use } from 'react';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/utils/client-fetch';
import { PostType } from '@/types/social/posts';
import { ApiResponse } from '@/types/api/api-response';
import { useAction } from 'next-safe-action/hooks';
import { copyOrderAction } from '@/actions/feed';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';

interface PostPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default function PostPage({ params }: PostPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const postId = resolvedParams.postId;

  const { data: postResponse, isLoading, error } = useQuery<ApiResponse<PostType>>({
    queryKey: ['post', postId],
    queryFn: () => clientFetch<ApiResponse<PostType>>(`/api/posts/${postId}`),
    enabled: !!postId,
  });

  const post = postResponse?.data;

  const { execute: copyOrder, isExecuting: isCopying } = useAction(copyOrderAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || 'Order copied to your cart successfully!');
        router.push('/cart');
      } else {
        toast.error(data?.message || 'Failed to copy order.');
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message || 'Failed to copy order.');
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary h-10 w-10" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto flex items-center justify-center py-20">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <PostDetailPage
      post={post}
      onAddToCart={() => copyOrder(Number(post.id))}
    />
  );
}
