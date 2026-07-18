<?php

namespace App\Repositories\Interfaces;

use App\Models\Cart;

interface CartRepositoryInterface extends BaseRepositoryInterface
{
    public function findOrCreateForUserAndRestaurant(int $userId, int $restaurantId): Cart;
}
