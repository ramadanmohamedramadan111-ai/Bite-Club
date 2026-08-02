<?php

namespace App\Services\Application\User\Cart;

use App\DTOs\User\Cart\AddItemToCartDto;
use App\DTOs\User\Cart\GetCartDto;
use App\DTOs\User\Cart\UpdateCartItemQuantityDto;
use App\DTOs\User\Cart\RemoveCartItemDto;
use App\DTOs\User\Cart\ClearCartDto;

use App\DTOs\User\Cart\MergeCartDto;

use App\Services\Domain\User\Cart\CartDomainService;
use App\Models\Cart;

class CartApplicationService
{
    public function __construct(
        private readonly CartDomainService $cartDomainService
    ) {}

    public function addItem(AddItemToCartDto $dto): void
    {
        $this->cartDomainService->addItem(
            $dto->getUserId(),
            $dto->getRestaurantId(),
            $dto->getItemId(),
            $dto->getQuantity(),
            $dto->getNotes()
        );
    }

    public function getCart(GetCartDto $dto): ?Cart
    {
        return $this->cartDomainService->getCart($dto->getUserId());
    }

    public function updateItemQuantity(UpdateCartItemQuantityDto $dto): void
    {
        $this->cartDomainService->updateItemQuantity(
            $dto->getUserId(),
            $dto->getCartItemId(),
            $dto->getQuantity()
        );
    }

    public function removeItem(RemoveCartItemDto $dto): void
    {
        $this->cartDomainService->removeItem(
            $dto->getUserId(),
            $dto->getCartItemId()
        );
    }

    public function clearCart(ClearCartDto $dto): void
    {
        $this->cartDomainService->clearCart($dto->getUserId());
    }

    public function mergeCart(MergeCartDto $dto): void
    {
        $this->cartDomainService->mergeCart(
            $dto->getUserId(),
            $dto->getRestaurantId(),
            $dto->getItems()
        );
    }
}
