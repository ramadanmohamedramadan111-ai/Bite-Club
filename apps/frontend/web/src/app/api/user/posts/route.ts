import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import type { PostType } from '@/types/social/posts';
import type { PaginatedResponse } from '@/types/api/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '10';

    const response = await serverFetch<
      ApiResponse<PaginatedResponse<PostType>>
    >(`/user/posts?per_page=${perPage}&page=${page}`);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API route /api/user/posts error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch user posts' },
      { status: 500 },
    );
  }
}
