<?php

namespace App\Repositories\Interfaces;

use App\Models\GroupOrder;
use Illuminate\Database\Eloquent\Collection;

interface GroupOrderRepositoryInterface extends BaseRepositoryInterface
{
    public function findActiveGroupOrderForGroup(int $groupId): ?GroupOrder;
}
