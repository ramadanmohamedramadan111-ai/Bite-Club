<?php

namespace App\DTOs\User\GroupOrder;

use App\Http\Requests\User\GroupOrder\PlaceGroupOrderRequest;

class PlaceGroupOrderDto
{
    public function __construct(
        private readonly int $userId,
        private readonly int $groupOrderId,
        private readonly string $orderType,
        private readonly string $paymentOptionId,
        private readonly ?float $lat,
        private readonly ?float $long,
    ) {}

    public static function fromValidatedRequest(PlaceGroupOrderRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            userId: (int) $validated['user_id'],
            groupOrderId: (int) $validated['group_order_id'],
            orderType: $validated['order_type'],
            paymentOptionId: $validated['payment_option_id'],
            lat: isset($validated['lat']) ? (float) $validated['lat'] : null,
            long: isset($validated['long']) ? (float) $validated['long'] : null,
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getGroupOrderId(): int
    {
        return $this->groupOrderId;
    }

    public function getOrderType(): string
    {
        return $this->orderType;
    }

    public function getPaymentOptionId(): string
    {
        return $this->paymentOptionId;
    }

    public function getLat(): ?float
    {
        return $this->lat;
    }

    public function getLong(): ?float
    {
        return $this->long;
    }
}
