<?php

namespace App\DTOs\Restaurant\Dashboard;

use App\Http\Requests\Restaurant\Dashboard\RestaurantDashboardRequest;

class RestaurantDashboardDto
{
    public function __construct(
        private readonly int $restaurantId,
        private readonly string $period
    ) {}

    public static function fromValidatedRequest(RestaurantDashboardRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            (int) $validated['restaurant_id'],
            $validated['period']
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getPeriod(): string
    {
        return $this->period;
    }
}
