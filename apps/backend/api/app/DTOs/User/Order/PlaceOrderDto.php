<?php

namespace App\DTOs\User\Order;

use App\Http\Requests\User\Order\PlaceOrderRequest;

class PlaceOrderDto
{
    public function __construct(
        private readonly int $userId,
        private readonly string $orderType,
        private readonly string $paymentOptionId,
        private readonly ?float $lat = null,
        private readonly ?float $long = null,
        private readonly bool $isGroupOrder = false
    ) {}

    public static function fromValidatedRequest(PlaceOrderRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['user_id'],
            $validated['order_type'],
            $validated['payment_option_id'],
            $validated['lat'] ?? null,
            $validated['long'] ?? null,
            false // always false when coming from individual place request
        );
    }

    public function getUserId(): int
    {
        return $this->userId;
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

    public function isGroupOrder(): bool
    {
        return $this->isGroupOrder;
    }
}
