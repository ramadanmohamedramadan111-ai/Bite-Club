import { NextResponse } from 'next/server';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import type { OrderResponse } from '@/types/orders/order';

export async function GET() {
  try {
    const response = await serverFetch<ApiResponse<OrderResponse[]>>(
      '/user/posts/shareable-orders',
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API route /api/orders error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch shareable orders' },
      { status: 500 },
    );
  }
}
