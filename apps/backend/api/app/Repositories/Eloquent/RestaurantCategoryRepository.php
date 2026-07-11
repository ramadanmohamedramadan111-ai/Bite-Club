<?php

namespace App\Repositories\Eloquent;

use App\Models\RestaurantCategory;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;

class RestaurantCategoryRepository extends BaseRepository implements RestaurantCategoryRepositoryInterface
{
    public function __construct(RestaurantCategory $model)
    {
        parent::__construct($model);
    }
}
