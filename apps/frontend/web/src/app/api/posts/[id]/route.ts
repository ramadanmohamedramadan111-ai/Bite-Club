import { NextResponse } from 'next/server';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import { PostType } from '@/types/social/posts';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;

    const response = await serverFetch<ApiResponse<PostType>>(
      `/posts/${id}`,
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(`API route /api/posts/${id} error:`, error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch post details' },
      { status: 500 },
    );
  }
}
