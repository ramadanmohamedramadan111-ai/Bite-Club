<?php

namespace App\Services\Application\User\Cart;

use App\DTOs\User\Cart\AddItemToCartDto;
use App\DTOs\User\Cart\ListCartsDto;
use App\DTOs\User\Cart\UpdateCartItemQuantityDto;
use App\DTOs\User\Cart\RemoveCartItemDto;
use App\Services\Domain\User\Cart\CartDomainService;
use Illuminate\Database\Eloquent\Collection;

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

    public function listCarts(ListCartsDto $dto): Collection
    {
        return $this->cartDomainService->listCarts($dto->getUserId());
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
}
