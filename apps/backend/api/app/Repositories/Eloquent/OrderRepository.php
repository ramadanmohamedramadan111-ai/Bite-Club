<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Order\OrderTypeEnum;
use App\Enums\Payment\PaymentMethodEnum;
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

    public function findOrderForRestaurant(int $orderId, int $restaurantId)
    {
        return $this->model->where('id', $orderId)
            ->where('restaurant_id', $restaurantId)
            ->with(['payments'])
            ->first();
    }

    public function getPaginatedOrderHistory(int $restaurantId, array $filters, int $page, int $perPage)
    {
        $query = $this->model->where('restaurant_id', $restaurantId)
            ->with(['user', 'payments', 'items']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['order_type'])) {
            $query->where('order_type', $filters['order_type']);
        }

        if (isset($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        // Order history is usually sorted by latest first
        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }
}
