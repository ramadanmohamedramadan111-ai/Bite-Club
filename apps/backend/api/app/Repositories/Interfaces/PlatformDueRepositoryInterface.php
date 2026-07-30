<?php

namespace App\Repositories\Interfaces;

use App\Models\PlatformDue;

interface PlatformDueRepositoryInterface extends BaseRepositoryInterface
{
    public function firstOrCreateForOrder(int $orderId, array $data): PlatformDue;
}
