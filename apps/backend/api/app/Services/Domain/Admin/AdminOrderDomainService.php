<?php

namespace App\Services\Domain\Admin;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminOrderDomainService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {}

    public function list(array $filters, int $page, int $perPage): LengthAwarePaginator
    {
        return $this->orderRepository->getAdminOrders($filters, $page, $perPage);
    }

    public function getStatistics(array $filters): array
    {
        $dateFilter = [];
        if (isset($filters['from']) && $filters['from'] !== '' && isset($filters['to']) && $filters['to'] !== '') {
            $dateFilter['from'] = $filters['from'];
            $dateFilter['to'] = $filters['to'];
        } elseif (isset($filters['period']) && $filters['period'] !== '') {
            $dateFilter['period'] = $filters['period'];
        }

        return $this->orderRepository->getAdminOrderStats($dateFilter);
    }

    public function getOrderDetails(int $orderId)
    {
        return $this->orderRepository->query()
            ->with(['user', 'restaurant', 'items', 'payments'])
            ->find($orderId);
    }
}
