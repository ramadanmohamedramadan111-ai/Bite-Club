<?php

namespace App\Repositories\Interfaces;

use \Illuminate\Support\Collection;
use App\Models\PlatformDue;

interface PlatformDueRepositoryInterface extends BaseRepositoryInterface
{
    public function firstOrCreateForOrder(int $orderId, array $data): PlatformDue;
    public function getUninvoicedDuesGroupedByRestaurant(): Collection;
    public function markAsInvoiced(array $dueIds, int $invoiceId): void;
}
