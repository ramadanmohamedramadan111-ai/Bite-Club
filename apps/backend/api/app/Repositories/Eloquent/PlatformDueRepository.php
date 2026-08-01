<?php

namespace App\Repositories\Eloquent;

use \App\Enums\Invoice\PlatformDueStatusEnum;
use \Illuminate\Support\Collection;
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

    public function getUninvoicedDuesGroupedByRestaurant(): Collection
    {
        return $this->model
            ->where('invoice_status', PlatformDueStatusEnum::UNINVOICED->value)
            ->get()
            ->groupBy('restaurant_id');
    }

    public function markAsInvoiced(array $dueIds, int $invoiceId): void
    {
        $this->model
            ->whereIn('id', $dueIds)
            ->update([
                'invoice_status' => PlatformDueStatusEnum::INVOICED->value,
                'invoice_id' => $invoiceId,
            ]);
    }
}
