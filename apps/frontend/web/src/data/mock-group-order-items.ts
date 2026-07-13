import type { CartItem, CartMemberReference } from '@/types/cart/cart';

export const MOCK_GROUP_MEMBER_SESSION_ID = 'mock-member-alex';

export const MOCK_GROUP_MEMBER = {
  sessionId: MOCK_GROUP_MEMBER_SESSION_ID,
  name: 'Alex Johnson',
};

export function createMockGroupOrderItems(): CartItem[] {
  return [
    {
      cartItemId: crypto.randomUUID(),
      itemId: '1',
      name: 'Sushi Platter',
      image: 'https://picsum.photos/400/300?1',
      quantity: 1,
      basePrice: 25.99,
      unitPrice: 25.99,
      totalPrice: 25.99,
      configurationKey: 'mock-sushi-platter',
      selectedOptions: [
        {
          groupId: 'size',
          groupName: 'Size',
          optionId: 'medium',
          optionName: 'Medium',
          price: 5,
        },
        {
          groupId: 'drink',
          groupName: 'Drink',
          optionId: 'coke',
          optionName: 'Coke',
          price: 0,
        },
      ],
      addedBy: {
        sessionId: MOCK_GROUP_MEMBER_SESSION_ID,
        name: MOCK_GROUP_MEMBER.name,
      },
    },
    {
      cartItemId: crypto.randomUUID(),
      itemId: '2',
      name: 'Salmon Nigiri',
      image: 'https://picsum.photos/400/300?2',
      quantity: 2,
      basePrice: 12.99,
      unitPrice: 12.99,
      totalPrice: 25.98,
      configurationKey: 'mock-salmon-nigiri',
      selectedOptions: [],
      specialInstructions: 'Extra wasabi',
      addedBy: {
        sessionId: MOCK_GROUP_MEMBER_SESSION_ID,
        name: MOCK_GROUP_MEMBER.name,
      },
    },
  ];
}

export function createMockGroupMember() {
  return {
    id: crypto.randomUUID(),
    sessionId: MOCK_GROUP_MEMBER_SESSION_ID,
    name: MOCK_GROUP_MEMBER.name,
    isOwner: false,
    isReady: true,
  };
}
