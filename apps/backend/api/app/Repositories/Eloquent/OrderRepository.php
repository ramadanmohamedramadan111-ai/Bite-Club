<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Enums\Order\OrderStatusEnum;
use App\Enums\Payment\PaymentMethodEnum;
use Carbon\Carbon;

class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    public function __construct(Order $model)
    {
        parent::__construct($model);
    }

    public function getLiveOrdersForRestaurant(int $restaurantId)
    {
        $visibleStatuses = [
            OrderStatusEnum::PENDING->value,
            OrderStatusEnum::PREPARING->value,
            OrderStatusEnum::READY->value,
            OrderStatusEnum::OUT_FOR_DELIVERY->value,
            OrderStatusEnum::COMPLETED->value,
            OrderStatusEnum::CANCELLED->value,
        ];

        return $this->model->where('restaurant_id', $restaurantId)
            ->whereIn('status', [
                OrderStatusEnum::PENDING->value,
                OrderStatusEnum::PREPARING->value,
                OrderStatusEnum::READY->value,
                OrderStatusEnum::OUT_FOR_DELIVERY->value,
            ])
            ->with(['items', 'payments', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findOrderForRestaurant(int $orderId, int $restaurantId)
    {
        return $this->model->where('id', $orderId)
            ->where('restaurant_id', $restaurantId)
            ->with(['items.item', 'payments', 'user', 'restaurant'])
            ->first();
    }

    public function getPaginatedOrderHistory(int $restaurantId, array $filters, int $page, int $perPage)
    {
        $query = $this->model->where('restaurant_id', $restaurantId)
            ->whereIn('status', [
                OrderStatusEnum::COMPLETED->value,
                OrderStatusEnum::CANCELLED->value,
            ]);

        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', Carbon::parse($filters['start_date']));
        }

        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', Carbon::parse($filters['end_date']));
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $query->with(['items', 'payments', 'user'])
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function getActiveOrdersForUser(int $userId)
    {
        return $this->model->where('user_id', $userId)
            ->whereIn('status', [
                OrderStatusEnum::PENDING->value,
                OrderStatusEnum::PREPARING->value,
                OrderStatusEnum::READY->value,
                OrderStatusEnum::OUT_FOR_DELIVERY->value,
            ])
            ->with(['restaurant', 'items', 'payments'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPaginatedPastOrdersForUser(int $userId, int $page, int $perPage)
    {
        $query = $this->model->where('user_id', $userId)
            ->whereIn('status', [
                OrderStatusEnum::COMPLETED->value,
                OrderStatusEnum::CANCELLED->value,
            ])
            ->with(['restaurant', 'items', 'payments'])
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function findOrderForUser(int $orderId, int $userId)
    {
        return $this->model->where('id', $orderId)
            ->where('user_id', $userId)
            ->with(['restaurant', 'items', 'payments'])
            ->first();
    }

    public function getAdminOrders(array $filters, int $page, int $perPage)
    {
        $query = $this->model->newQuery()
            ->with(['user', 'restaurant']);

        // Apply date filter
        $query = $this->applyDateFilter($query, $filters);

        // Apply other filters (ONLY to table data)
        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('orders.id', $search)
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', '%' . $search . '%')
                         ->orWhere('last_name', 'like', '%' . $search . '%')
                         ->orWhere('email', 'like', '%' . $search . '%')
                         ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ['%' . $search . '%']);
                  })
                  ->orWhereHas('restaurant', function ($rq) use ($search) {
                      $rq->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        if (isset($filters['status']) && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['restaurant_id']) && $filters['restaurant_id'] !== '') {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function getAdminOrderStats(array $dateFilter): array
    {
        $query = $this->model->newQuery();
        $query = $this->applyDateFilter($query, $dateFilter);

        $results = $query->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        $total = 0;
        $pending = 0;
        $processing = 0;
        $completed = 0;
        $cancelled = 0;

        foreach ($results as $result) {
            $status = $result->status instanceof \UnitEnum ? $result->status->value : $result->status;
            $count = (int) $result->count;
            $total += $count;

            if ($status === OrderStatusEnum::PENDING->value) {
                $pending += $count;
            } elseif ($status === OrderStatusEnum::COMPLETED->value) {
                $completed += $count;
            } elseif ($status === OrderStatusEnum::CANCELLED->value) {
                $cancelled += $count;
            } else {
                $processing += $count;
            }
        }

        return [
            'total_orders'      => $total,
            'pending_orders'    => $pending,
            'processing_orders' => $processing,
            'completed_orders'  => $completed,
            'cancelled_orders'  => $cancelled,
        ];
    }

    private function applyDateFilter($query, array $filters)
    {
        if (isset($filters['from']) && $filters['from'] !== '' && isset($filters['to']) && $filters['to'] !== '') {
            $query->whereDate('created_at', '>=', $filters['from'])
                  ->whereDate('created_at', '<=', $filters['to']);
        } elseif (isset($filters['period']) && $filters['period'] !== '') {
            $period = $filters['period'];
            if ($period === 'today') {
                $query->whereDate('created_at', Carbon::today());
            } elseif ($period === 'week') {
                $query->where('created_at', '>=', Carbon::now()->startOfWeek());
            } elseif ($period === 'month') {
                $query->where('created_at', '>=', Carbon::now()->startOfMonth());
            }
        }
        return $query;
    }
    public function getExpiredUnpaidOrders(int $timeoutMinutes)
    {
        return $this->model->where('status', OrderStatusEnum::AWAITING_PAYMENT->value)
            ->where('created_at', '<=', now()->subMinutes($timeoutMinutes))
            ->with(['payments', 'items'])
            ->get();
    }

    public function getForgottenPendingCashOrders(int $timeoutMinutes = 40)
    {
        return $this->model->where('status', OrderStatusEnum::PENDING->value)
            ->where('created_at', '<=', now()->subMinutes($timeoutMinutes))
            ->whereHas('payments', function ($query) {
                $query->where('payment_method', PaymentMethodEnum::CASH->value);
            })
            ->with(['payments', 'items', 'user'])
            ->get();
    }
}
