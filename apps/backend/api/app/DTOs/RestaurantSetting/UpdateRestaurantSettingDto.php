<?php

namespace App\DTOs\RestaurantSetting;

use App\Http\Requests\RestaurantSetting\UpdateRestaurantSettingRequest;

class UpdateRestaurantSettingDto
{
    private int $id;
    private ?float $depositThreshold;
    private ?float $depositPercentage;

    public function __construct(
        int $id,
        ?float $depositThreshold = null,
        ?float $depositPercentage = null
    ) {
        $this->id = $id;
        $this->depositThreshold = $depositThreshold;
        $this->depositPercentage = $depositPercentage;
    }

    public static function fromValidatedRequest(UpdateRestaurantSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $request->route('id'),
            isset($data['deposit_threshold']) ? (float) $data['deposit_threshold'] : null,
            isset($data['deposit_percentage']) ? (float) $data['deposit_percentage'] : null
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getDepositThreshold(): ?float
    {
        return $this->depositThreshold;
    }

    public function getDepositPercentage(): ?float
    {
        return $this->depositPercentage;
    }

    public function toArray(): array
    {
        $data = [];
        if (!is_null($this->depositThreshold)) {
            $data['deposit_threshold'] = $this->depositThreshold;
        }
        if (!is_null($this->depositPercentage)) {
            $data['deposit_percentage'] = $this->depositPercentage;
        }
        return $data;
    }
}
