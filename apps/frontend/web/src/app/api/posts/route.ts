import { NextResponse } from 'next/server';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse, PaginatedResponse } from '@/types/api/api-response';
import { PostType } from '@/types/social/posts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = Math.floor(offset / limit) + 1;
    const perPage = limit;

    const response = await serverFetch<
      ApiResponse<PaginatedResponse<PostType>>
    >(`/posts?page=${page}&per_page=${perPage}`);

    console.log('RESPONSE IS', response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API route /api/posts error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch posts' },
      { status: 500 },
    );
  }
}

