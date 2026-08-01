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

    public function getAllInvoices(array $filters, int $perPage = 15): array
    {
        $query = $this->model->with(['restaurant:id,name']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ]
        ];
    }

    public function findByIdWithDetails(int $id): ?Invoice
    {
        return $this->model->with(['restaurant:id,name', 'platformDues.order'])
            ->where('id', $id)
            ->first();
    }

    public function getStatistics(): array
    {
        $stats = $this->model->selectRaw('
            count(*) as total_count,
            sum(amount) as total_amount,
            sum(case when status = ? then 1 else 0 end) as paid_count,
            sum(case when status = ? then amount else 0 end) as paid_amount,
            sum(case when status = ? then 1 else 0 end) as unpaid_count,
            sum(case when status = ? then amount else 0 end) as unpaid_amount,
            sum(case when status = ? then 1 else 0 end) as overdue_count,
            sum(case when status = ? then amount else 0 end) as overdue_amount
        ', [
            InvoiceStatusEnum::PAID->value,
            InvoiceStatusEnum::PAID->value,
            InvoiceStatusEnum::UNPAID->value,
            InvoiceStatusEnum::UNPAID->value,
            InvoiceStatusEnum::OVERDUE->value,
            InvoiceStatusEnum::OVERDUE->value
        ])->first();

        return [
            'total_invoices_count' => (int) $stats->total_count,
            'total_amount' => (float) $stats->total_amount,
            'paid_invoices_count' => (int) $stats->paid_count,
            'paid_amount' => (float) $stats->paid_amount,
            'unpaid_invoices_count' => (int) $stats->unpaid_count,
            'unpaid_amount' => (float) $stats->unpaid_amount,
            'overdue_invoices_count' => (int) $stats->overdue_count,
            'overdue_amount' => (float) $stats->overdue_amount,
        ];
    }

    public function hasOverdueInvoices(int $restaurantId): bool
    {
        return $this->model
            ->where('restaurant_id', $restaurantId)
            ->where('status', InvoiceStatusEnum::OVERDUE->value)
            ->exists();
    }
}
