import { NextResponse } from 'next/server';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import type { UserResponse } from '@/types/profile/user';

export async function GET() {
  try {
    const response = await serverFetch<ApiResponse<UserResponse>>('/user/me');

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API route /api/user/me error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch user profile' },
      { status: 500 },
    );
  }
}
