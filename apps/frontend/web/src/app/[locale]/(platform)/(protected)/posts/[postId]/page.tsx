import { PostDetailPage } from '@/components/posts/PostDetailPage';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api';
import { PostType } from '@/types/posts';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;

  let post: PostType | null = null;

  try {
    const res = await serverFetch<ApiResponse<PostType>>(`/posts/${postId}`);
    post = res?.data ?? null;
  } catch (error) {
    console.error('Failed to fetch post:', error);
  }

  if (!post) {
    notFound();
  }

  return <PostDetailPage post={post} />;
}

