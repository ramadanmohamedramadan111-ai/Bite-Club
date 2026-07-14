<?php

namespace App\Repositories\Eloquent;

use App\Models\GeneralSetting;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;

class GeneralSettingRepository extends BaseRepository implements GeneralSettingRepositoryInterface
{
    public function __construct(GeneralSetting $model)
    {
        parent::__construct($model);
    }
}
