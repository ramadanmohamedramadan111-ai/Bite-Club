<?php

namespace App\DTOs\Restaurant\Order;

use App\Http\Requests\Restaurant\Order\AvailableOrderStatusRequest;

class AvailableOrderStatusDto
{
    public function __construct(
        private readonly int $orderId,
        private readonly int $restaurantId
    ) {}

    public static function fromValidatedRequest(AvailableOrderStatusRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['order_id'],
            (int) $validated['restaurant_id']
        );
    }

    public function getOrderId(): int
    {
        return $this->orderId;
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }
}
