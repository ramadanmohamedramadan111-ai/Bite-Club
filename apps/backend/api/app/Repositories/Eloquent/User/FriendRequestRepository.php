<?php

namespace App\Repositories\Eloquent\User;

use App\Models\FriendRequest;
use App\Repositories\Eloquent\BaseRepository;
use App\Repositories\Interfaces\User\FriendRequestRepositoryInterface;

class FriendRequestRepository extends BaseRepository implements FriendRequestRepositoryInterface
{
    public function __construct(FriendRequest $model)
    {
        parent::__construct($model);
    }
}
