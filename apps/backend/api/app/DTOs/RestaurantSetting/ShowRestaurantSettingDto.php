<?php

namespace App\DTOs\RestaurantSetting;

use App\Http\Requests\RestaurantSetting\ShowRestaurantSettingRequest;

class ShowRestaurantSettingDto
{
    private int $restaurantId;

    public function __construct(int $restaurantId)
    {
        $this->restaurantId = $restaurantId;
    }

    public static function fromValidatedRequest(ShowRestaurantSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['restaurant_id']
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }
}
