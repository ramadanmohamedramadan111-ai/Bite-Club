<?php

namespace App\Repositories\Eloquent\User;

use App\Models\GroupMember;
use App\Repositories\Eloquent\BaseRepository;
use App\Repositories\Interfaces\User\GroupMemberRepositoryInterface;

class GroupMemberRepository extends BaseRepository implements GroupMemberRepositoryInterface
{
    public function __construct(GroupMember $model)
    {
        parent::__construct($model);
    }
}
