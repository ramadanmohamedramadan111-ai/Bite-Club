import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: "Notifications | Bite Club",
  description: "Stay updated with group order status changes, friend requests, and updates.",
};
