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
}
