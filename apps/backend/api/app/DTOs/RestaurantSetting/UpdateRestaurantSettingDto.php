<?php

namespace App\DTOs\RestaurantSetting;

use App\Http\Requests\RestaurantSetting\UpdateRestaurantSettingRequest;

class UpdateRestaurantSettingDto
{
    private int $id;
    private ?int $restaurantId;
    private ?float $commissionRate;
    private ?float $depositThreshold;
    private ?float $depositPercentage;
    private ?float $serviceFeeAmount;

    public function __construct(
        int $id,
        ?int $restaurantId = null,
        ?float $commissionRate = null,
        ?float $depositThreshold = null,
        ?float $depositPercentage = null,
        ?float $serviceFeeAmount = null
    ) {
        $this->id = $id;
        $this->restaurantId = $restaurantId;
        $this->commissionRate = $commissionRate;
        $this->depositThreshold = $depositThreshold;
        $this->depositPercentage = $depositPercentage;
        $this->serviceFeeAmount = $serviceFeeAmount;
    }

    public static function fromValidatedRequest(UpdateRestaurantSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $request->route('id'),
            isset($data['restaurant_id']) ? (int) $data['restaurant_id'] : null,
            isset($data['commission_rate']) ? (float) $data['commission_rate'] : null,
            isset($data['deposit_threshold']) ? (float) $data['deposit_threshold'] : null,
            isset($data['deposit_percentage']) ? (float) $data['deposit_percentage'] : null,
            isset($data['service_fee_amount']) ? (float) $data['service_fee_amount'] : null
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getRestaurantId(): ?int
    {
        return $this->restaurantId;
    }

    public function getCommissionRate(): ?float
    {
        return $this->commissionRate;
    }

    public function getDepositThreshold(): ?float
    {
        return $this->depositThreshold;
    }

    public function getDepositPercentage(): ?float
    {
        return $this->depositPercentage;
    }

    public function getServiceFeeAmount(): ?float
    {
        return $this->serviceFeeAmount;
    }

    public function toArray(): array
    {
        $data = [];
        if (!is_null($this->restaurantId)) {
            $data['restaurant_id'] = $this->restaurantId;
        }
        if (!is_null($this->commissionRate)) {
            $data['commission_rate'] = $this->commissionRate;
        }
        if (!is_null($this->depositThreshold)) {
            $data['deposit_threshold'] = $this->depositThreshold;
        }
        if (!is_null($this->depositPercentage)) {
            $data['deposit_percentage'] = $this->depositPercentage;
        }
        if (!is_null($this->serviceFeeAmount)) {
            $data['service_fee_amount'] = $this->serviceFeeAmount;
        }
        return $data;
    }
}
