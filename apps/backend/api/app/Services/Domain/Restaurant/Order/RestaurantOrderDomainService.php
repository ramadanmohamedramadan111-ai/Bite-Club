<?php

namespace App\Services\Domain\Restaurant\Order;

use App\Repositories\Interfaces\OrderRepositoryInterface;
use App\Services\Domain\Restaurant\Order\Support\OrderStatusTransition;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RestaurantOrderDomainService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository,
        private readonly OrderStatusTransition $statusTransition
    ) {
    }

    public function getLiveOrders(int $restaurantId): Collection
    {
        return $this->orderRepository->getLiveOrdersForRestaurant($restaurantId);
    }

    public function getAvailableStatuses(int $orderId, int $restaurantId): array
    {
        $order = $this->orderRepository->findOrderForRestaurant($orderId, $restaurantId);

        if (!$order) {
            throw new NotFoundHttpException(trans('order.not_found') ?? 'Order not found.');
        }

        return $this->statusTransition->getAvailableTransitions($order);
    }
}
