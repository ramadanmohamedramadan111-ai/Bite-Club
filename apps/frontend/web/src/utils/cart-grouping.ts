import type { CartItem, CartMemberReference } from '@/types/cart/cart';

export type UserCartGroup = {
  key: string;
  name: string;
  items: CartItem[];
  subtotal: number;
};

export function getItemOwnerKey(reference?: CartMemberReference): string {
  if (!reference) {
    return 'unknown';
  }

  return reference.sessionId ?? reference.userId ?? reference.name ?? 'unknown';
}

export function getItemOwnerName(reference?: CartMemberReference): string {
  return reference?.name ?? 'Guest';
}

export function groupCartItemsByUser(items: CartItem[]): UserCartGroup[] {
  const groups = new Map<string, UserCartGroup>();

  for (const item of items) {
    const key = getItemOwnerKey(item.addedBy);
    const name = getItemOwnerName(item.addedBy);
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
      existing.subtotal += item.totalPrice;
    } else {
      groups.set(key, {
        key,
        name,
        items: [item],
        subtotal: item.totalPrice,
      });
    }
  }

  return Array.from(groups.values());
}

export function isSameItemOwner(
  a?: CartMemberReference,
  b?: CartMemberReference,
): boolean {
  return getItemOwnerKey(a) === getItemOwnerKey(b);
}
