<?php

namespace App\Repositories\Eloquent;

use App\Models\RestaurantOpeningHour;
use App\Repositories\Interfaces\RestaurantOpeningHourRepositoryInterface;

class RestaurantOpeningHourRepository extends BaseRepository implements RestaurantOpeningHourRepositoryInterface
{
    public function __construct(RestaurantOpeningHour $model)
    {
        parent::__construct($model);
    }
}
