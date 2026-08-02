<?php

namespace App\DTOs\User\Cart;

use App\Http\Requests\User\Cart\MergeCartRequest;

class MergeCartDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $restaurantId,
        private readonly array $items
    ) {}

    public static function fromValidatedRequest(MergeCartRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['user_id'],
            $validated['restaurant_id'],
            $validated['items']
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

    public function getItems(): array
    {
        return $this->items;
    }
}
