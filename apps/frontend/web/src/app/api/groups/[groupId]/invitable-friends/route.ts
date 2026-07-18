import { NextRequest, NextResponse } from 'next/server';

import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { GroupMember } from '@/types/groups/groups';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;

  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get('search') ?? '';
  const page = searchParams.get('page') ?? '1';
  const perPage = searchParams.get('per_page') ?? '10';

  const response = await serverFetch<
    ApiResponse<PaginatedResponse<GroupMember>>
  >(
    `/groups/${groupId}/invitable-friends?search=${search}&page=${page}&per_page=${perPage}`,
    'GET',
  );

  return NextResponse.json(response);
}
