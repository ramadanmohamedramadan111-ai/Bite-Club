<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Post;

class PostPolicy
{
    public function create(User $user): bool
    {
        return true;
    }

    public function like(User $user, Post $post): bool
    {
        return $post->isActiveFeedPost();
    }

    public function copy(User $user, Post $post): bool
    {
        return $post->isActiveFeedPost();
    }
}
