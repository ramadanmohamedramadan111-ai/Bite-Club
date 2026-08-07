import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import NotificationsPageView from '@/components/notifications/NotificationsPageView';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Notification } from '@/types/notifications';
import { getUserId } from '@/utils/api-helpers';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page ?? '1');
  const userId = await getUserId();

  let initialData: PaginatedResponse<Notification> = {
    items: [],
    meta: {
      total: 0,
      current_page: page,
      last_page: 1,
      per_page: 15,
    },
  };

  try {
    const response = await serverFetch<ApiResponse<PaginatedResponse<Notification>>>(
      `/user/notifications?page=${page}&per_page=15`,
      'GET',
      {
        next: {
          tags: [`notifications-${userId}`],
        },
      }
    );
    if (response?.data) {
      initialData = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch notifications on server:', error);
  }

  return (
    <NotificationsPageView
      initialData={initialData}
      currentPage={page}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('notifications.title'),
    description: t('notifications.description'),
  };
}
