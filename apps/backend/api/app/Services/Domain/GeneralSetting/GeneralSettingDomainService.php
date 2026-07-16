<?php

namespace App\Services\Domain\GeneralSetting;

use App\Models\GeneralSetting;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;

class GeneralSettingDomainService
{
    public function __construct(
        private GeneralSettingRepositoryInterface $generalSettingRepository
    ) {}



    public function current(): GeneralSetting
    {
        return $this->generalSettingRepository->firstOrFail();
    }

    public function updateCurrent(array $data): GeneralSetting
    {
        $current = $this->current();
        $this->generalSettingRepository->update($current->id, $data);
        return $this->current();
    }


}
