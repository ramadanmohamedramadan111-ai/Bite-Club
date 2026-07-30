<?php

namespace App\Repositories\Interfaces;

use \Illuminate\Support\Collection;
use App\Models\Invoice;

interface InvoiceRepositoryInterface extends BaseRepositoryInterface
{
    public function getUnpaidOverdueInvoices(): Collection;
    public function markAsOverdue(array $invoiceIds): void;
}
