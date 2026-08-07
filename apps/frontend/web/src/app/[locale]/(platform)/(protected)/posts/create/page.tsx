import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { serverFetch } from '@/utils/server-fetch';
import type { ApiResponse } from '@/types/api';
import type { OrderResponse } from '@/types/order';
import { CreatePostPage } from '@/components/posts/CreatePostPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('createPost.title'),
    description: t('createPost.description'),
  };
}

export default async function CreatePostRoute() {
  let orders: OrderResponse[] = [];

  try {
    const res = await serverFetch<ApiResponse<OrderResponse[]>>(
      '/user/posts/shareable-orders',
    );
    orders = res.data;
  } catch {}

  return <CreatePostPage orders={orders} />;
}

