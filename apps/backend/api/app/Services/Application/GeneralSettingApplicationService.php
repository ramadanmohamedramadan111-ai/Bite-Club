<?php

namespace App\Services\Application;

use App\DTOs\GeneralSetting\IndexGeneralSettingDto;
use App\DTOs\GeneralSetting\ShowGeneralSettingDto;
use App\DTOs\GeneralSetting\UpdateGeneralSettingDto;
use App\DTOs\GeneralSetting\StoreGeneralSettingDto;
use App\Services\Domain\GeneralSetting\GeneralSettingDomainService;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;

class GeneralSettingApplicationService
{
    public function __construct(
        private GeneralSettingDomainService       $generalSettingDomainService,
        private GeneralSettingRepositoryInterface $generalSettingRepository
    ) {}

    public function index(IndexGeneralSettingDto $dto): array
    {
        $data = $this->generalSettingDomainService->list($dto->toArray());

        return array_filter([
            'items' => $data['items']->map(fn($item) => $this->mapItem($item))->toArray(),
            'meta'  => $data['meta'] ?? null,
        ]);
    }

    public function show(ShowGeneralSettingDto $dto): array
    {
        $setting = $this->generalSettingDomainService->findOrFail($dto->getId());
        return $this->mapItem($setting);
    }

    public function store(StoreGeneralSettingDto $dto): array
    {
        $setting = $this->generalSettingDomainService->create($dto->toArray());
        return $this->mapItem($setting);
    }

    public function update(UpdateGeneralSettingDto $dto): array
    {
        $setting = $this->generalSettingDomainService->update($dto->getId(), $dto->toArray());
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
