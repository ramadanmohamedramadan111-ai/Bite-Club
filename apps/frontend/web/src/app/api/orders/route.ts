import { NextResponse } from 'next/server';
import { serverFetch } from '@/utils/server-fetch';
import { ApiResponse } from '@/types/api/api-response';
import { PastOrder } from '@/types/social/orders';

interface BackendOrder {
  id: number;
  user_id: number;
  restaurant_id: number;
  order_type: string;
  status: string;
  subtotal: string;
  delivery_fee: string;
  service_fee: string;
  total: string;
  created_at: string;
  updated_at: string;
  restaurant: {
    id: number;
    name: string;
    logo_url: string | null;
    address: string;
  };
  items: Array<{
    id: number;
    order_id: number;
    item_id: number;
    item_name: string;
    quantity: number;
    price: string;
    notes: string | null;
  }>;
}

function mapBackendOrderToPastOrder(order: BackendOrder): PastOrder {
  return {
    id: order.id.toString(),
    restaurantId: order.restaurant_id.toString(),
    restaurantName: order.restaurant?.name || 'Restaurant',
    restaurantAddress: order.restaurant?.address || '',
    restaurantImage: order.restaurant?.logo_url || '',
    items: (order.items || []).map((item) => ({
      id: item.id.toString(),
      name: item.item_name,
      price: parseFloat(item.price),
      quantity: item.quantity,
    })),
    totalPrice: parseFloat(order.total),
    orderedAt: order.created_at,
    image: order.restaurant?.logo_url || '',
  };
}

export async function GET(request: Request) {
  try {
    const response = await serverFetch<ApiResponse<BackendOrder[]>>(
      '/user/orders',
    );

    const pastOrders = response.data.map(mapBackendOrderToPastOrder);

    return NextResponse.json(pastOrders);
  } catch (error: any) {
    console.error('API route /api/orders error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch user orders' },
      { status: 500 },
    );
  }
}
