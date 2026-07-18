<?php

namespace App\Repositories\Interfaces;

use App\Models\Cart;

use Illuminate\Database\Eloquent\Collection;

interface CartRepositoryInterface extends BaseRepositoryInterface
{
    public function findOrCreateForUserAndRestaurant(int $userId, int $restaurantId): Cart;
    public function getUserCarts(int $userId): Collection;
}
