<?php

namespace App\Services\Domain\Restaurant\Order;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RestaurantOrderDomainService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {}

    public function getLiveOrders(int $restaurantId): Collection
    {
        return $this->orderRepository->getLiveOrdersForRestaurant($restaurantId);
    }
}
