<?php

namespace App\Repositories\Interfaces;

use \Illuminate\Support\Collection;
use App\Models\Invoice;

interface InvoiceRepositoryInterface extends BaseRepositoryInterface
{
    public function getUnpaidOverdueInvoices(): \Illuminate\Support\Collection;
    public function markAsOverdue(array $invoiceIds): void;
    public function getForRestaurant(int $restaurantId, array $filters, int $perPage = 15): array;
    public function findByIdForRestaurant(int $id, int $restaurantId): ?Invoice;
}
