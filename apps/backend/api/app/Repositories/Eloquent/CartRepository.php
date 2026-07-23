<?php

namespace App\Repositories\Eloquent;

use App\Models\Cart;
use App\Repositories\Interfaces\CartRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

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

    public function findOrCreateForGroupOrder(int $userId, int $restaurantId, int $groupOrderId): Cart
    {
        return $this->model->firstOrCreate(
            ['user_id' => $userId],
            ['restaurant_id' => $restaurantId, 'group_order_id' => $groupOrderId]
        );
    }

    public function getUserCart(int $userId): ?Cart
    {
        return $this->model->with(['restaurant', 'items'])->where('user_id', $userId)->first();
    }
}
