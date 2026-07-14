import { RestaurantRegisterForm } from '@/components/auth/RestaurantRegisterForm';
import { ApiResponse } from '@/types/api/api-response';
import { RestaurantCategory } from '@/types/restaurant/restaurant';
import { serverFetch } from '@/utils/server-fetch';
import React from 'react';

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

