<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Enums\Order\OrderStatusEnum;
use Carbon\Carbon;

class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    public function __construct(Order $model)
    {
        parent::__construct($model);
    }

    public function getLiveOrdersForRestaurant(int $restaurantId)
    {
        $visibleStatuses = [
            OrderStatusEnum::PENDING->value,
            OrderStatusEnum::PREPARING->value,
            OrderStatusEnum::READY->value,
            OrderStatusEnum::OUT_FOR_DELIVERY->value,
            OrderStatusEnum::COMPLETED->value,
            OrderStatusEnum::CANCELLED->value,
        ];

        return $this->model->where('restaurant_id', $restaurantId)
            ->whereIn('status', $visibleStatuses)
            ->where(function ($query) {
                $query->whereNotIn('status', [
                    OrderStatusEnum::COMPLETED->value,
                    OrderStatusEnum::CANCELLED->value
                ])->orWhereDate('updated_at', Carbon::today());
            })
            ->with(['items', 'user:id,first_name,last_name,email,phone_number', 'payments'])
            ->orderByRaw("CASE status 
                WHEN 'pending' THEN 1 
                WHEN 'preparing' THEN 2 
                WHEN 'ready' THEN 3 
                WHEN 'out_for_delivery' THEN 4 
                WHEN 'completed' THEN 5 
                WHEN 'cancelled' THEN 6 
                ELSE 7 END")
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
