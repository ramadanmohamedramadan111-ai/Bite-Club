import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { serverFetch } from '@/utils/server-fetch';
import type { ApiResponse } from '@/types/api';
import type { LeaderBoardItem } from '@/types/posts';
import LeaderboardFeed from '@/components/posts/LeaderboardFeed';

export default async function LeaderboardPage() {
  let items: LeaderBoardItem[] = [];

  try {
    const res = await serverFetch<ApiResponse<{ items: LeaderBoardItem[] }>>(
      '/leaderboards?type=weekly',
    );
    items = res.data.items;
  } catch {}

  return <LeaderboardFeed items={items} />;
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('leaderboard.title'),
    description: t('leaderboard.description'),
  };
}
