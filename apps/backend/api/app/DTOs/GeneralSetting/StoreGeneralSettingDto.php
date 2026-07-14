<?php

namespace App\DTOs\GeneralSetting;

use App\Http\Requests\GeneralSetting\StoreGeneralSettingRequest;

class StoreGeneralSettingDto
{
    private float $commissionRate;
    private float $serviceFeeAmount;

    public function __construct(
        float $commissionRate,
        float $serviceFeeAmount
    ) {
        $this->commissionRate = $commissionRate;
        $this->serviceFeeAmount = $serviceFeeAmount;
    }

    public static function fromValidatedRequest(StoreGeneralSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (float) $data['commission_rate'],
            (float) $data['service_fee_amount']
        );
    }

    public function getCommissionRate(): float
    {
        return $this->commissionRate;
    }

    public function getServiceFeeAmount(): float
    {
        return $this->serviceFeeAmount;
    }

    public function toArray(): array
    {
        return [
            'commission_rate'    => $this->commissionRate,
            'service_fee_amount' => $this->serviceFeeAmount,
        ];
    }
}
