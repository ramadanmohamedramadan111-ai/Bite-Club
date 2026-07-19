<?php

namespace App\DTOs\User\Cart;

use App\Http\Requests\User\Cart\UpdateCartItemQuantityRequest;

class UpdateCartItemQuantityDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $cartItemId,
        private readonly int $quantity
    ) {}

    public static function fromValidatedRequest(UpdateCartItemQuantityRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['user_id'],
            $validated['cart_item_id'],
            $validated['quantity']
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getCartItemId(): int
    {
        return $this->cartItemId;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }
}
