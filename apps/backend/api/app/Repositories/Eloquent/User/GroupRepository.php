<?php

namespace App\Repositories\Eloquent\User;

use App\Models\Group;
use App\Repositories\Eloquent\BaseRepository;
use App\Repositories\Interfaces\User\GroupRepositoryInterface;

class GroupRepository extends BaseRepository implements GroupRepositoryInterface
{
    public function __construct(Group $model)
    {
        parent::__construct($model);
    }
}
