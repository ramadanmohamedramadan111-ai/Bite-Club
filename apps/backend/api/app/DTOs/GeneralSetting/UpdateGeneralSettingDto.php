<?php

namespace App\DTOs\GeneralSetting;

use App\Http\Requests\GeneralSetting\UpdateGeneralSettingRequest;

class UpdateGeneralSettingDto
{
    private int $id;
    private ?float $commissionRate;
    private ?float $serviceFeeAmount;

    public function __construct(
        int $id,
        ?float $commissionRate = null,
        ?float $serviceFeeAmount = null
    ) {
        $this->id = $id;
        $this->commissionRate = $commissionRate;
        $this->serviceFeeAmount = $serviceFeeAmount;
    }

    public static function fromValidatedRequest(UpdateGeneralSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (int) $request->route('id'),
            isset($data['commission_rate']) ? (float) $data['commission_rate'] : null,
            isset($data['service_fee_amount']) ? (float) $data['service_fee_amount'] : null
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getCommissionRate(): ?float
    {
        return $this->commissionRate;
    }

    public function getServiceFeeAmount(): ?float
    {
        return $this->serviceFeeAmount;
    }

    public function toArray(): array
    {
        $data = [];
        if (!is_null($this->commissionRate)) {
            $data['commission_rate'] = $this->commissionRate;
        }
        if (!is_null($this->serviceFeeAmount)) {
            $data['service_fee_amount'] = $this->serviceFeeAmount;
        }
        return $data;
    }
}
