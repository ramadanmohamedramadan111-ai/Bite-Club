<?php

namespace App\Repositories\Eloquent;

use App\Models\GroupOrderItemGuest;
use App\Repositories\Interfaces\GroupOrderItemGuestRepositoryInterface;

class GroupOrderItemGuestRepository extends BaseRepository implements GroupOrderItemGuestRepositoryInterface
{
    public function __construct(GroupOrderItemGuest $model)
    {
        parent::__construct($model);
    }
}
