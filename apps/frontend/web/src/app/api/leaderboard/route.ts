import { NextResponse } from 'next/server';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'weekly';

    const response = await serverFetch<ApiResponse<any>>(
      `/leaderboards?type=${type}`,
    );

    // Convert backend's pagination object to frontend's meta object
    const pagination = response.data?.pagination;
    const paginatedData = {
      items: response.data?.items || [],
      meta: pagination ? {
        current_page: pagination.current_page,
        last_page: pagination.last_page,
        per_page: pagination.per_page,
        total: pagination.total,
      } : {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      }
    };

    return NextResponse.json({
      success: response.success,
      message: response.message,
      data: paginatedData,
    });
  } catch (error: any) {
    console.error('API route leaderboard error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch leaderboard' },
      { status: 500 },
    );
  }
}
