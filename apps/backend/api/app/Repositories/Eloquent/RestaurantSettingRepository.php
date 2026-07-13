<?php

namespace App\Repositories\Eloquent;

use App\Models\RestaurantSetting;
use App\Repositories\Interfaces\RestaurantSettingRepositoryInterface;

class RestaurantSettingRepository extends BaseRepository implements RestaurantSettingRepositoryInterface
{
    public function __construct(RestaurantSetting $model)
    {
        parent::__construct($model);
    }
}
