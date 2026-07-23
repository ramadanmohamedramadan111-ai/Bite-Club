<?php

namespace App\Repositories\Eloquent;

use App\Models\GroupOrderItem;
use App\Repositories\Interfaces\GroupOrderItemRepositoryInterface;

class GroupOrderItemRepository extends BaseRepository implements GroupOrderItemRepositoryInterface
{
    public function __construct(GroupOrderItem $model)
    {
        parent::__construct($model);
    }
}
