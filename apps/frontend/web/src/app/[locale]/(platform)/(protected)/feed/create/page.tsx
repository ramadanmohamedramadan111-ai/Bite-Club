import { serverFetch } from '@/utils/server-fetch';
import type { ApiResponse } from '@/types/api';
import type { OrderResponse } from '@/types/order';
import { CreatePostPage } from '@/components/posts/CreatePostPage';

export default async function CreatePostRoute() {
  let orders: OrderResponse[] = [];

  try {
    const res = await serverFetch<ApiResponse<OrderResponse[]>>(
      '/user/posts/shareable-orders',
    );
    orders = res.data;
  } catch {}

  return <CreatePostPage orders={orders} />;
}

