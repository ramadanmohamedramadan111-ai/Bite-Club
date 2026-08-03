import { GroupType } from '@/types/groups';
import type { Metadata } from 'next';
import { serverFetch } from '@/utils/server-fetch';
import { buildQueryString } from '@/utils/api-helpers';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import type { GroupOrderHistory } from '@/types/group-order';
import GroupHistoryTab from '@/components/groups/GroupHistoryTab';
import { parseSearchParams, PaginatedParams } from '@/utils/validate-search-params';
import InvalidSearchParams from '@/components/errors/InvalidSearchParams';

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
  const raw = await searchParams;
  const parsed = parseSearchParams(PaginatedParams, raw);
  if (!parsed.success) return <InvalidSearchParams />;
  const { page = '1', per_page = '10' } = parsed.data;

  const query = buildQueryString({ group_id: Number(id), page, per_page });

  const response = await serverFetch<
    ApiResponse<PaginatedResponse<GroupOrderHistory>>
  >(`/user/group-orders/history${query}`, 'GET', {
    next: { tags: ['group-orders-history', `group-orders-history-${id}`] },
  });
  const { items: orders, meta } = response.data;

  return <GroupHistoryTab groupId={Number(id)} orders={orders} meta={meta} />;
}



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await serverFetch<ApiResponse<GroupType>>(`/groups/${id}`);
    const group = res?.data;
    if (group) {
      return {
        title: `${group.name} Order History | Bite Club`,
        description: `Order history of the food group ${group.name} on Bite Club.`,
      };
    }
  } catch (e) {
    // Fail silently
  }
  return {
    title: "Group Order History | Bite Club",
  };
}
