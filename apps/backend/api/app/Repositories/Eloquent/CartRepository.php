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
            'group_order_id'=> null,
        ]);
    }

    public function findOrCreateForGroupOrder(int $userId, int $restaurantId, int $groupOrderId): Cart
    {
        $cart = $this->model->where('user_id', $userId)->whereNotNull('group_order_id')->first();
        
        if ($cart) {
            $cart->update([
                'group_order_id' => $groupOrderId,
                'restaurant_id' => $restaurantId,
            ]);
            return $cart->fresh();
        }

        return $this->model->create([
            'user_id' => $userId,
            'group_order_id' => $groupOrderId,
            'restaurant_id' => $restaurantId,
        ]);
    }

    public function getUserCart(int $userId, bool $isGroupOrder = false): ?Cart
    {
        $query = $this->model->with(['restaurant', 'items'])->where('user_id', $userId);
        
        if ($isGroupOrder) {
            $query->whereNotNull('group_order_id');
        } else {
            $query->whereNull('group_order_id');
        }

        return $query->first();
    }
}
