<?php

namespace App\Repositories\Eloquent\User;

use App\Models\Friendship;
use App\Repositories\Eloquent\BaseRepository;
use App\Repositories\Interfaces\User\FriendshipRepositoryInterface;

class FriendshipRepository extends BaseRepository implements FriendshipRepositoryInterface
{
    public function __construct(Friendship $model)
    {
        parent::__construct($model);
    }
}
