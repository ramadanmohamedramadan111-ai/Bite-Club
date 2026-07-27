<?php

namespace App\Services\Application\Admin;

use App\DTOs\Admin\Order\IndexOrderDto;
use App\Services\Domain\Admin\AdminOrderDomainService;
use App\Http\Resources\Admin\Order\AdminOrderResource;
use App\Http\Resources\Admin\Order\AdminOrderDetailsResource;

class AdminOrderApplicationService
{
    public function __construct(
        private readonly AdminOrderDomainService $adminOrderDomainService
    ) {}

    public function getOrdersDashboard(IndexOrderDto $dto): array
    {
        $filters = $dto->toArray();
        $page = $dto->getPage() ?? 1;
        $perPage = 15;

        $ordersPaginator = $this->adminOrderDomainService->list($filters, $page, $perPage);
        $statistics = $this->adminOrderDomainService->getStatistics($filters);

        $paginatedData = AdminOrderResource::collection($ordersPaginator)->response()->getData(true);

        return [
            'filters' => [
                'period' => $dto->getPeriod(),
                'from'   => $dto->getFrom(),
                'to'     => $dto->getTo(),
            ],
            'statistics' => $statistics,
            'orders' => [
                'data'  => $paginatedData['data'] ?? [],
                'links' => $paginatedData['links'] ?? (object)[],
                'meta'  => $paginatedData['meta'] ?? (object)[],
            ],
        ];
    }

    public function getOrderDetails(int $orderId): ?AdminOrderDetailsResource
    {
        $order = $this->adminOrderDomainService->getOrderDetails($orderId);

        if (!$order) {
            return null;
        }

        return new AdminOrderDetailsResource($order);
    }
}
