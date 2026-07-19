<?php

namespace App\DTOs\User\Cart;

use App\Http\Requests\User\Cart\RemoveCartItemRequest;

class RemoveCartItemDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $cartItemId
    ) {}

    public static function fromValidatedRequest(RemoveCartItemRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['user_id'],
            $validated['cart_item_id']
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
}
