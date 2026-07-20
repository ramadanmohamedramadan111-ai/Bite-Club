<?php

namespace App\Repositories\Interfaces;

interface OrderPaymentRepositoryInterface extends BaseRepositoryInterface
{
    public function findPendingOnlinePaymentByOrderId(int $orderId);
}
