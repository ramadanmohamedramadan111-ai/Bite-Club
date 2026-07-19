<?php

namespace App\Repositories\Eloquent;

use App\Models\OrderPayment;
use App\Repositories\Interfaces\OrderPaymentRepositoryInterface;

class OrderPaymentRepository extends BaseRepository implements OrderPaymentRepositoryInterface
{
    public function __construct(OrderPayment $model)
    {
        parent::__construct($model);
    }
}
