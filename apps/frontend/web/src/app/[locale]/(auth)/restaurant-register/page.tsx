import type { Metadata } from 'next';
import { RestaurantRegisterForm } from '@/components/auth/RestaurantRegisterForm';
import { ApiResponse } from '@/types/api';
import { RestaurantCategory } from '@/types/restaurant';
import { serverFetch } from '@/utils/server-fetch';

export default async function page() {
  const data = await serverFetch<ApiResponse<{ items: RestaurantCategory[] }>>(
    '/restaurant/categories?all=true',
  );
  const categories = data.data.items;

  return (
    <>
      <RestaurantRegisterForm categories={categories} />
    </>
  );
}



export const metadata: Metadata = {
  title: "Partner Registration | Bite Club",
  description: "Register your restaurant with Bite Club to reach more customers, receive online orders, and boost your sales.",
};
