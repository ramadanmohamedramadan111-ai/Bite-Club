<?php

namespace App\Services\Application;

use App\DTOs\GeneralSetting\UpdateGeneralSettingDto;
use App\Services\Domain\GeneralSetting\GeneralSettingDomainService;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;

class GeneralSettingApplicationService
{
    public function __construct(
        private GeneralSettingDomainService       $generalSettingDomainService,
        private GeneralSettingRepositoryInterface $generalSettingRepository
    ) {}

    public function show(): array
    {
        $setting = $this->generalSettingDomainService->current();
        return $this->mapItem($setting);
    }

    public function update(UpdateGeneralSettingDto $dto): array
    {
        $setting = $this->generalSettingDomainService->updateCurrent($dto->toArray());
        return $this->mapItem($setting);
    }

    private function mapItem($setting): array
    {
        return [
            'id'                 => $setting->id,
            'commission_rate'    => $setting->commission_rate,
            'service_fee_amount' => $setting->service_fee_amount,
            'updated_at'         => $setting->updated_at ? $setting->updated_at->toIso8601String() : null,
        ];
    }
}
