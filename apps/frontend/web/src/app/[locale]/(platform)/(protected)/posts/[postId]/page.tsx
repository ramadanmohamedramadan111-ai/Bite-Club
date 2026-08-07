import type { Metadata } from 'next';
import { PostDetailPage } from '@/components/posts/PostDetailPage';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api';
import { PostType } from '@/types/posts';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

interface PostPageProps {
  params: Promise<{
    locale: string;
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



export async function generateMetadata({ params }: { params: Promise<{ locale: string; postId: string }> }): Promise<Metadata> {
  const { locale, postId } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  try {
    const res = await serverFetch<ApiResponse<PostType>>(`/posts/${postId}`);
    const post = res?.data;
    if (post) {
      return {
        title: t('postDetail.title', { user: post.user.name }),
        description: post.caption || t('postDetail.fallbackDescription'),
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: t('postDetail.fallbackTitle'),
    description: t('postDetail.fallbackDescription'),
  };
}
