<?php

namespace App\Services\Application\Restaurant\Order;

use App\Services\Domain\Restaurant\Order\RestaurantOrderDomainService;
use App\DTOs\Restaurant\Order\LiveOrdersDto;
use App\DTOs\Restaurant\Order\AvailableOrderStatusDto;
use App\DTOs\Restaurant\Order\UpdateOrderStatusDto;
use App\DTOs\Restaurant\Order\OrderHistoryDto;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class RestaurantOrderApplicationService
{
    public function __construct(
        private readonly RestaurantOrderDomainService $domainService
    ) {}

    public function getLiveOrders(LiveOrdersDto $dto): Collection
    {
        return $this->domainService->getLiveOrders($dto->getRestaurantId());
    }

    public function getAvailableStatuses(AvailableOrderStatusDto $dto): array
    {
        return $this->domainService->getAvailableStatuses($dto->getOrderId(), $dto->getRestaurantId());
    }

    public function updateOrderStatus(UpdateOrderStatusDto $dto): \App\Models\Order
    {
        return $this->domainService->updateOrderStatus(
            $dto->getOrderId(),
            $dto->getRestaurantId(),
            $dto->getStatus()
        );
    }

    public function getOrderHistory(OrderHistoryDto $dto): LengthAwarePaginator
    {
        return $this->domainService->getOrderHistory(
            $dto->getRestaurantId(),
            $dto->getFilters(),
            $dto->getPage(),
            $dto->getPerPage()
        );
    }
}
