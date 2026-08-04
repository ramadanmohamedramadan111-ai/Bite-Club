import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

export type SmartWaiterItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  why?: string;
};

export type SmartWaiterSuggestion = {
  restaurant_id: number;
  restaurant_name: string;
  items: SmartWaiterItem[];
  total_price: number;
  status: 'pending' | 'accepted' | 'declined';
};

export type AIChatMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestion?: SmartWaiterSuggestion;
};

export type SmartWaiterResponse = {
  recommended_restaurant_id: number | null;
  restaurant_name: string | null;
  reply: string;
  total_price: number;
  recommended_menu_item_ids: number[];
  items: SmartWaiterItem[];
  conversation_id: number;
};

type ChatPayload = {
  message: string;
  conversation_id?: number;
  latitude: number;
  longitude: number;
  locale: 'en' | 'ar';
};

export function useAIChatMutation() {
  return useMutation({
    mutationFn: (payload: ChatPayload) =>
      api.post<{ data: SmartWaiterResponse }>('/ai/smart-waiter/chat', payload),
  });
}

export function useAIChatAddToCartMutation() {
  return useMutation({
    mutationFn: (payload: { restaurant_id: number; items: { id: number; quantity: number }[] }) =>
      api.post<{ data: unknown }>('/ai/smart-waiter/add-to-cart', payload),
  });
}