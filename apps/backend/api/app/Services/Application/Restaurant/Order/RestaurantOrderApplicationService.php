<?php

namespace App\Services\Application\Restaurant\Order;

use App\Services\Domain\Restaurant\Order\RestaurantOrderDomainService;
use App\DTOs\Restaurant\Order\LiveOrdersDto;
use App\DTOs\Restaurant\Order\AvailableOrderStatusDto;
use Illuminate\Database\Eloquent\Collection;

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
}
