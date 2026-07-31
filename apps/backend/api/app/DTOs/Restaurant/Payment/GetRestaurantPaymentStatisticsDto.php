<?php

namespace App\DTOs\Restaurant\Payment;

use App\Http\Requests\Restaurant\Payment\GetRestaurantPaymentStatisticsRequest;

class GetRestaurantPaymentStatisticsDto
{
    public function __construct(
        private readonly int $restaurantId
    ) {}

    public static function fromValidatedRequest(GetRestaurantPaymentStatisticsRequest $request): self
    {
        $validated = $request->validated();
        
        return new self(
            (int) $validated['restaurant_id']
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }
}
