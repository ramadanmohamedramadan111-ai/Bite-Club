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

