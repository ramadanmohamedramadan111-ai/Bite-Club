import { serverFetch } from '@/utils/server-fetch';
import { buildQueryString } from '@/utils/api-helpers';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import type { GroupOrderHistory } from '@/types/group-order/group-order';
import GroupHistoryTab from '@/components/groups/GroupHistoryTab';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    per_page?: string;
  }>;
};

export default async function GroupHistoryPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { page = '1', per_page = '10' } = await searchParams;

  const query = buildQueryString({ group_id: Number(id), page, per_page });

  const response = await serverFetch<
    ApiResponse<PaginatedResponse<GroupOrderHistory>>
  >(`/user/group-orders/history${query}`, 'GET', {
    next: { tags: ['group-orders-history', `group-orders-history-${id}`] },
  });
  const { items: orders, meta } = response.data;

  return <GroupHistoryTab groupId={Number(id)} orders={orders} meta={meta} />;
}
