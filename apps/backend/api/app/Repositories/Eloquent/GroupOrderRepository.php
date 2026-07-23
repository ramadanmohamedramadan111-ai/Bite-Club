<?php

namespace App\Repositories\Eloquent;

use App\Models\GroupOrder;
use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Enums\GroupOrder\GroupOrderStatusEnum;

class GroupOrderRepository extends BaseRepository implements GroupOrderRepositoryInterface
{
    public function __construct(GroupOrder $model)
    {
        parent::__construct($model);
    }

    public function findActiveGroupOrderForGroup(int $groupId): ?GroupOrder
    {
        return $this->query()
            ->where('group_id', $groupId)
            ->where('status', GroupOrderStatusEnum::OPEN->value)
            ->first();
    }
}
