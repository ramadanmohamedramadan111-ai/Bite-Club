<?php

namespace App\Services\Application\User\Cart;

use App\DTOs\User\Cart\AddItemToCartDto;
use App\Services\Domain\User\Cart\CartDomainService;

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
}
