<?php

namespace App\Services\Domain\User\Cart;

use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Repositories\Interfaces\CartItemRepositoryInterface;
use App\Repositories\Interfaces\MenuItemRepositoryInterface;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
use App\Models\Cart;
use Exception;
use Illuminate\Database\Eloquent\Collection;

class CartDomainService
{
    public function __construct(
        private readonly CartRepositoryInterface $cartRepository,
        private readonly CartItemRepositoryInterface $cartItemRepository,
        private readonly MenuItemRepositoryInterface $menuItemRepository
    ) {}

    public function addItem(int $userId, int $restaurantId, int $itemId, int $quantity, ?string $notes): void
    {
        $item = $this->menuItemRepository->find($itemId);

        if (!$item || $item->availability !== MenuItemAvailabilityEnum::AVAILABLE) {
            throw new Exception(trans('cart.item_unavailable'));
        }

        // Validate item belongs to restaurant via category
        if ($item->menuCategory->restaurant_id !== $restaurantId) {
            throw new Exception(trans('cart.item_not_in_restaurant'));
        }

        // Enforce single cart per user: delete any cart belonging to a different restaurant
        $existingCart = $this->cartRepository->getUserCart($userId);
        if ($existingCart && $existingCart->restaurant_id !== $restaurantId) {
            $this->cartRepository->delete($existingCart->id);
        }

        $cart = $this->cartRepository->findOrCreateForUserAndRestaurant($userId, $restaurantId);

        $this->cartItemRepository->updateOrCreateItem($cart->id, [
            'item_id'    => $item->id,
            'item_name'  => $item->title,
            'quantity'   => $quantity,
            'unit_price' => $item->price,
            'notes'      => $notes,
        ]);
    }
    public function getCart(int $userId): ?Cart
    {
        return $this->cartRepository->getUserCart($userId);
    }

    public function updateItemQuantity(int $userId, int $cartItemId, int $quantity): void
    {
        $cartItem = $this->cartItemRepository->findOrFail($cartItemId);
        $cart = $this->cartRepository->findOrFail($cartItem->cart_id);

        if ($cart->user_id !== $userId) {
            throw new Exception(trans('cart.unauthorized_action'));
        }

        $this->cartItemRepository->update($cartItemId, ['quantity' => $quantity]);
    }

    public function removeItem(int $userId, int $cartItemId): void
    {
        $cartItem = $this->cartItemRepository->findOrFail($cartItemId);
        $cart = $this->cartRepository->findOrFail($cartItem->cart_id);

        if ($cart->user_id !== $userId) {
            throw new Exception(trans('cart.unauthorized_action'));
        }

        $this->cartItemRepository->delete($cartItemId);
        
        // If cart is empty after removing the item, delete the cart
        if ($cart->items()->count() === 0) {
            $this->cartRepository->delete($cart->id);
        }
    }
}
