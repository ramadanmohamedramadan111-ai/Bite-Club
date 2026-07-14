<?php

namespace App\DTOs\RestaurantSetting;

use App\Http\Requests\RestaurantSetting\StoreRestaurantSettingRequest;

class StoreRestaurantSettingDto
{
    private int $restaurantId;
    private float $depositThreshold;
    private float $depositPercentage;

    public function __construct(
        int $restaurantId,
        float $depositThreshold,
        float $depositPercentage
    ) {
        $this->restaurantId = $restaurantId;
        $this->depositThreshold = $depositThreshold;
        $this->depositPercentage = $depositPercentage;
    }

    public static function fromValidatedRequest(StoreRestaurantSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['restaurant_id'],
            (float) $data['deposit_threshold'],
            (float) $data['deposit_percentage']
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getDepositThreshold(): float
    {
        return $this->depositThreshold;
    }

    public function getDepositPercentage(): float
    {
        return $this->depositPercentage;
    }

    public function toArray(): array
    {
        return [
            'restaurant_id'      => $this->restaurantId,
            'deposit_threshold'  => $this->depositThreshold,
            'deposit_percentage' => $this->depositPercentage,
        ];
    }
}
