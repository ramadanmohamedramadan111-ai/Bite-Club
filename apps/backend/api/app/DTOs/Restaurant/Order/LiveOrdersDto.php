<?php

namespace App\DTOs\Restaurant\Order;

use App\Http\Requests\Restaurant\Order\LiveOrdersRequest;

class LiveOrdersDto
{
    public function __construct(
        private readonly int $restaurantId
    ) {}

    public static function fromValidatedRequest(LiveOrdersRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['restaurant_id']
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }
}
