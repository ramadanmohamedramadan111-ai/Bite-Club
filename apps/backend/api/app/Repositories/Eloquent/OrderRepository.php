<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Enums\Order\OrderStatusEnum;
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
            ->whereIn('status', [
                OrderStatusEnum::PENDING->value,
                OrderStatusEnum::PREPARING->value,
                OrderStatusEnum::READY->value,
                OrderStatusEnum::OUT_FOR_DELIVERY->value,
            ])
            ->with(['items', 'payments', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findOrderForRestaurant(int $orderId, int $restaurantId)
    {
        return $this->model->where('id', $orderId)
            ->where('restaurant_id', $restaurantId)
            ->with(['items.item', 'payments', 'user', 'restaurant'])
            ->first();
    }

    public function getPaginatedOrderHistory(int $restaurantId, array $filters, int $page, int $perPage)
    {
        $query = $this->model->where('restaurant_id', $restaurantId)
            ->whereIn('status', [
                OrderStatusEnum::COMPLETED->value,
                OrderStatusEnum::CANCELLED->value,
            ]);

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', Carbon::parse($filters['start_date']));
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', Carbon::parse($filters['end_date']));
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $query->with(['items', 'payments', 'user'])
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function getActiveOrdersForUser(int $userId)
    {
        return $this->model->where('user_id', $userId)
            ->whereIn('status', [
                OrderStatusEnum::PENDING->value,
                OrderStatusEnum::PREPARING->value,
                OrderStatusEnum::READY->value,
                OrderStatusEnum::OUT_FOR_DELIVERY->value,
            ])
            ->with(['restaurant', 'items', 'payments'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPaginatedPastOrdersForUser(int $userId, int $page, int $perPage)
    {
        $query = $this->model->where('user_id', $userId)
            ->whereIn('status', [
                OrderStatusEnum::COMPLETED->value,
                OrderStatusEnum::CANCELLED->value,
            ])
            ->with(['restaurant', 'items', 'payments'])
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function findOrderForUser(int $orderId, int $userId)
    {
        return $this->model->where('id', $orderId)
            ->where('user_id', $userId)
            ->with(['restaurant', 'items', 'payments'])
            ->first();
    }

    public function getExpiredUnpaidOrders(int $timeoutMinutes)
    {
        return $this->model->where('status', OrderStatusEnum::AWAITING_PAYMENT->value)
            ->where('created_at', '<=', now()->subMinutes($timeoutMinutes))
            ->with(['payments', 'items'])
            ->get();
    }

    public function getForgottenPendingCashOrders(int $timeoutMinutes = 40)
    {
        return $this->model->where('status', OrderStatusEnum::PENDING->value)
            ->where('created_at', '<=', now()->subMinutes($timeoutMinutes))
            ->whereHas('payments', function ($query) {
                $query->where('payment_method', PaymentMethodEnum::CASH->value);
            })
            ->with(['payments', 'items', 'user'])
            ->get();
    }
}
