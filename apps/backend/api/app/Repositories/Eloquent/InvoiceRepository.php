<?php

namespace App\Repositories\Eloquent;

use \App\Enums\Invoice\InvoiceStatusEnum;
use \Illuminate\Pagination\LengthAwarePaginator;
use \Illuminate\Support\Collection;
use App\Models\Invoice;
use App\Repositories\Eloquent\BaseRepository;
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

    public function getForRestaurant(int $restaurantId, array $filters, int $perPage = 15): array
    {
        $query = $this->model->where('restaurant_id', $restaurantId);

        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'items' => collect($paginator->items()),
            'meta'  => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ];
    }

    public function findByIdForRestaurant(int $id, int $restaurantId): ?Invoice
    {
        return $this->model->with(['platformDues.order'])
            ->where('id', $id)
            ->where('restaurant_id', $restaurantId)
            ->first();
    }
}
