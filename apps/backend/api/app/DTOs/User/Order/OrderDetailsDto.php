<?php

namespace App\DTOs\User\Order;

use App\Http\Requests\User\Order\OrderDetailsRequest;

class OrderDetailsDto
{
    public function __construct(
        private readonly int $orderId,
        private readonly int $userId
    ) {}

    public static function fromValidatedRequest(OrderDetailsRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['order_id'],
            (int) $validated['user_id']
        );
    }

    public function getOrderId(): int
    {
        return $this->orderId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }
}
