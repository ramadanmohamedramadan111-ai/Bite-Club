<?php

namespace App\DTOs\Restaurant\Order;

use App\Http\Requests\Restaurant\Order\UpdateOrderStatusRequest;

class UpdateOrderStatusDto
{
    public function __construct(
        private readonly int $orderId,
        private readonly int $restaurantId,
        private readonly string $status
    ) {}

    public static function fromValidatedRequest(UpdateOrderStatusRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['order_id'],
            (int) $validated['restaurant_id'],
            $validated['status']
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

    public function getStatus(): string
    {
        return $this->status;
    }
}
