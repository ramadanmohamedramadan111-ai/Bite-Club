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
            ->with(['items', 'user:id,name,email,phone_number', 'payments'])
            ->orderByRaw("FIELD(status, 'pending', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled')")
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
