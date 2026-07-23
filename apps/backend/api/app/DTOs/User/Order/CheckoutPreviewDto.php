<?php

namespace App\DTOs\User\Order;

use App\Http\Requests\User\Order\CheckoutPreviewRequest;

class CheckoutPreviewDto
{
    public function __construct(
        private readonly int $userId,
        private readonly string $orderType,
        private readonly ?float $lat,
        private readonly ?float $long,
        private readonly bool $isGroupOrder = false
    ) {}

    public static function fromValidatedRequest(CheckoutPreviewRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            $validated['user_id'],
            $validated['order_type'],
            $validated['lat'] ?? null,
            $validated['long'] ?? null,
            false // always false when coming from individual checkout request
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
