import { NextRequest, NextResponse } from 'next/server';

import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { GroupTypeSimplified } from '@/types/groups';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const search = searchParams.get('search') ?? '';
  const page = searchParams.get('page') ?? '1';
  const perPage = searchParams.get('per_page') ?? '10';

  const response = await serverFetch<
    ApiResponse<PaginatedResponse<GroupTypeSimplified>>
  >(`/groups?search=${search}&page=${page}&per_page=${perPage}`, 'GET');

  return NextResponse.json(response);
}

