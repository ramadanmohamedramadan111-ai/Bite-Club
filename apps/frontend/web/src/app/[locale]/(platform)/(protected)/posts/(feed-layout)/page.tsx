import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PostsFeed from '@/components/posts/PostsFeed';

export default function PostsPage() {
  return <PostsFeed />;
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('postsFeed.title'),
    description: t('postsFeed.description'),
  };
}
