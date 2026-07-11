import { getRewardOfferById } from '@/data/mock-rewards';
import type { Cart, CartSummary } from '@/types/cart/cart';
import type { Redemption, RewardOffer } from '@/types/points/points';

type SummaryOptions = {
  fulfillmentType?: 'delivery' | 'pickup';
};

export function isRedemptionActive(redemption: Redemption) {
  if (redemption.status !== 'active') {
    return false;
  }

  return new Date(redemption.expiresAt).getTime() > Date.now();
}

export function calculateOfferDiscount(
  offer: RewardOffer,
  subtotal: number,
  deliveryFee: number,
): number {
  if (offer.minSubtotal && subtotal < offer.minSubtotal) {
    return 0;
  }

  switch (offer.discountType) {
    case 'percent_subtotal':
      return Math.min(subtotal, subtotal * (offer.discountValue / 100));
    case 'free_delivery':
      return Math.min(deliveryFee, offer.discountValue);
    case 'flat_subtotal':
      return Math.min(subtotal, offer.discountValue);
    default:
      return 0;
  }
}

export function buildCartSummary(
  cart: Cart,
  redemptions: Redemption[],
  options: SummaryOptions = {},
): CartSummary {
  const fulfillmentType = options.fulfillmentType ?? 'delivery';

  const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

  const baseDeliveryFee =
    fulfillmentType === 'delivery' ? cart.restaurantDeliveryFee || 0 : 0;

  const tax = 3;
  let discount = 0;
  const deliveryFee = baseDeliveryFee;
  let appliedRedemptionTitle: string | undefined;

  if (cart.type === 'individual' && cart.appliedRedemptionId) {
    const redemption = redemptions.find(
      (entry) => entry.id === cart.appliedRedemptionId,
    );
    const offer =
      redemption && isRedemptionActive(redemption)
        ? getRewardOfferById(redemption.offerId)
        : undefined;

    if (redemption && offer) {
      discount = calculateOfferDiscount(offer, subtotal, baseDeliveryFee);
      appliedRedemptionTitle = redemption.offerTitle;
    }
  }

  return {
    subtotal,
    deliveryFee: baseDeliveryFee,
    tax,
    discount,
    total: Math.max(0, subtotal + baseDeliveryFee + tax - discount),
    appliedRedemptionTitle,
  };
}
