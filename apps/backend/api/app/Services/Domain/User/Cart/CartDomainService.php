<?php

namespace App\Services\Domain\User\Cart;

use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Repositories\Interfaces\CartItemRepositoryInterface;
use App\Repositories\Interfaces\MenuItemRepositoryInterface;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
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

        $cart = $this->cartRepository->findOrCreateForUserAndRestaurant($userId, $restaurantId);

        $this->cartItemRepository->updateOrCreateItem($cart->id, [
            'item_id'    => $item->id,
            'item_name'  => $item->title,
            'quantity'   => $quantity,
            'unit_price' => $item->price,
            'notes'      => $notes,
        ]);
    }
    public function listCarts(int $userId): Collection
    {
        return $this->cartRepository->getUserCarts($userId);
    }
}
