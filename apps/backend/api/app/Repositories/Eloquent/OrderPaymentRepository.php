<?php

namespace App\Repositories\Eloquent;

use App\Models\OrderPayment;
use App\Repositories\Interfaces\OrderPaymentRepositoryInterface;
use App\Enums\Payment\PaymentMethodEnum;
use App\Enums\Payment\PaymentStatusEnum;

class OrderPaymentRepository extends BaseRepository implements OrderPaymentRepositoryInterface
{
    public function __construct(OrderPayment $model)
    {
        parent::__construct($model);
    }

    public function findPendingOnlinePaymentByOrderId(int $orderId)
    {
        return $this->model->where('order_id', $orderId)
            ->where('payment_method', PaymentMethodEnum::ONLINE->value)
            ->where('status', PaymentStatusEnum::PENDING->value)
            ->first();
    }

    public function hasOnlinePayment(int $orderId): bool
    {
        return $this->model->where('order_id', $orderId)
            ->where('payment_method', PaymentMethodEnum::ONLINE->value)
            ->exists();
    }

    public function updatePendingPaymentsStatus(int $orderId, string $status)
    {
        return $this->model->where('order_id', $orderId)
            ->where('status', PaymentStatusEnum::PENDING->value)
            ->update(['status' => $status]);
    }

    public function listRestaurantPayments(int $restaurantId, array $filters, int $perPage = 15): array
    {
        $query = $this->model->whereHas('order', function ($q) use ($restaurantId) {
            $q->where('restaurant_id', $restaurantId);
        })->with([
            'order:id,user_id,restaurant_id,status,total,created_at',
            'order.user:id,first_name,last_name,email'
        ]);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ]
        ];
    }
}
