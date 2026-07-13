<?php

namespace App\DTOs\RestaurantSetting;

use App\Http\Requests\RestaurantSetting\StoreRestaurantSettingRequest;

class StoreRestaurantSettingDto
{
    private int $restaurantId;
    private float $commissionRate;
    private float $depositThreshold;
    private float $depositPercentage;
    private float $serviceFeeAmount;

    public function __construct(
        int $restaurantId,
        float $commissionRate,
        float $depositThreshold,
        float $depositPercentage,
        float $serviceFeeAmount
    ) {
        $this->restaurantId = $restaurantId;
        $this->commissionRate = $commissionRate;
        $this->depositThreshold = $depositThreshold;
        $this->depositPercentage = $depositPercentage;
        $this->serviceFeeAmount = $serviceFeeAmount;
    }

    public static function fromValidatedRequest(StoreRestaurantSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $data['restaurant_id'],
            (float) $data['commission_rate'],
            (float) $data['deposit_threshold'],
            (float) $data['deposit_percentage'],
            (float) $data['service_fee_amount']
        );
    }

    public function getRestaurantId(): int
    {
        return $this->restaurantId;
    }

    public function getCommissionRate(): float
    {
        return $this->commissionRate;
    }

    public function getDepositThreshold(): float
    {
        return $this->depositThreshold;
    }

    public function getDepositPercentage(): float
    {
        return $this->depositPercentage;
    }

    public function getServiceFeeAmount(): float
    {
        return $this->serviceFeeAmount;
    }

    public function toArray(): array
    {
        return [
            'restaurant_id'      => $this->restaurantId,
            'commission_rate'    => $this->commissionRate,
            'deposit_threshold'  => $this->depositThreshold,
            'deposit_percentage' => $this->depositPercentage,
            'service_fee_amount' => $this->serviceFeeAmount,
        ];
    }
}
