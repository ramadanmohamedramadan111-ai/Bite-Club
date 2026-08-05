import { getItem, removeItem, setItem } from '@/lib/storage';

export const GUEST_USER_ID_KEY = 'biteclub.guest_user_id';
export const GUEST_GROUP_ORDERS_KEY = 'biteclub.guest_group_orders';

export type GuestGroupOrderEntry = {
  id: number;
  name: string;
};

export async function getGuestUserId(): Promise<string | null> {
  return getItem(GUEST_USER_ID_KEY);
}

export async function setGuestUserId(id: string): Promise<void> {
  await setItem(GUEST_USER_ID_KEY, id);
}

export async function getGuestGroupOrders(): Promise<GuestGroupOrderEntry[]> {
  const raw = await getItem(GUEST_GROUP_ORDERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getGuestNameForOrder(sessionId: number): Promise<string | null> {
  const orders = await getGuestGroupOrders();
  const match = orders.find((go) => Number(go.id) === Number(sessionId));
  return match?.name ?? null;
}

export async function saveGuestGroupOrder(sessionId: number, name: string): Promise<void> {
  const orders = await getGuestGroupOrders();
  const existing = orders.find((go) => Number(go.id) === Number(sessionId));
  if (existing) {
    existing.name = name;
  } else {
    orders.push({ id: Number(sessionId), name });
  }
  await setItem(GUEST_GROUP_ORDERS_KEY, JSON.stringify(orders));
}

export async function ensureGuestUserId(): Promise<string> {
  let id = await getGuestUserId();
  if (!id) {
    id = String(Date.now() * 1000 + Math.floor(Math.random() * 1000));
    await setGuestUserId(id);
  }
  return id;
}

export async function clearGuestData(): Promise<void> {
  await Promise.all([removeItem(GUEST_USER_ID_KEY), removeItem(GUEST_GROUP_ORDERS_KEY)]);
}
