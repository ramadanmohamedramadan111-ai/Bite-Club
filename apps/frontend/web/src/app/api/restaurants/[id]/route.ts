import { NextResponse } from 'next/server';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import { RestaurantType } from '@/types/restaurant/restaurant';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;

    const response = await serverFetch<ApiResponse<RestaurantType>>(
      `/user/restaurants/${id}`,
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API route restaurants/[id] error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch restaurant details' },
      { status: 500 },
    );
  }
}
