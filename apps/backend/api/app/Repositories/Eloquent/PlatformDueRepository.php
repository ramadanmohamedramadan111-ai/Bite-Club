<?php

namespace App\Repositories\Eloquent;

use App\Models\PlatformDue;
use App\Repositories\Interfaces\PlatformDueRepositoryInterface;

class PlatformDueRepository extends BaseRepository implements PlatformDueRepositoryInterface
{
    public function __construct(PlatformDue $model)
    {
        parent::__construct($model);
    }

    public function firstOrCreateForOrder(int $orderId, array $data): PlatformDue
    {
        return $this->model->firstOrCreate(['order_id' => $orderId], $data);
    }
}
