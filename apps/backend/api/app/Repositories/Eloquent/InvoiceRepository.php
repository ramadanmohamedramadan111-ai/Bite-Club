<?php

namespace App\Repositories\Eloquent;

use \App\Enums\Invoice\InvoiceStatusEnum;
use \Illuminate\Support\Collection;
use App\Models\Invoice;
use App\Repositories\Interfaces\InvoiceRepositoryInterface;

class InvoiceRepository extends BaseRepository implements InvoiceRepositoryInterface
{
    public function __construct(Invoice $model)
    {
        parent::__construct($model);
    }

    public function getUnpaidOverdueInvoices(): Collection
    {
        return $this->model
            ->where('status', InvoiceStatusEnum::UNPAID->value)
            ->where('due_date', '<', now()->toDateString())
            ->get();
    }

    public function markAsOverdue(array $invoiceIds): void
    {
        $this->model
            ->whereIn('id', $invoiceIds)
            ->update(['status' => InvoiceStatusEnum::OVERDUE->value]);
    }
}
