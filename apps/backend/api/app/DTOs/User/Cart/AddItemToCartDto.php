<?php

namespace App\DTOs\User\Cart;

use Illuminate\Http\Request;

class AddItemToCartDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $restaurantId,
        private readonly int $itemId,
        private readonly int $quantity,
        private readonly ?string $notes = null
    ) {}

    public static function fromValidatedRequest(Request $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['user_id'],
            $validated['restaurant_id'],
            $validated['item_id'],
            $validated['quantity'],
            $validated['notes'] ?? null
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getItemId(): int
    {
        return $this->itemId;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }
}
