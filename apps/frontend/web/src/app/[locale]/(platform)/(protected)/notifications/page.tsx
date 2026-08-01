import type { Metadata } from 'next';
import NotificationsPageView from '@/components/notifications/NotificationsPageView';

export default function NotificationsPage() {
  return <NotificationsPageView />;
}


export const metadata: Metadata = {
  title: "Notifications | Bite Club",
  description: "Stay updated with group order status changes, friend requests, and updates.",
};
