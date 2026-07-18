<?php

namespace App\Repositories\Eloquent;

use App\Models\Cart;
use App\Repositories\Interfaces\CartRepositoryInterface;

class CartRepository extends BaseRepository implements CartRepositoryInterface
{
    public function __construct(Cart $model)
    {
        parent::__construct($model);
    }

    public function findOrCreateForUserAndRestaurant(int $userId, int $restaurantId): Cart
    {
        return $this->model->firstOrCreate([
            'user_id'       => $userId,
            'restaurant_id' => $restaurantId,
        ]);
    }
}
