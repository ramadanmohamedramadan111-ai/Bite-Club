<?php

namespace App\Repositories\Interfaces;

interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    public function getLiveOrdersForRestaurant(int $restaurantId);
    public function findOrderForRestaurant(int $orderId, int $restaurantId);
    public function getPaginatedOrderHistory(int $restaurantId, array $filters, int $page, int $perPage);
    public function getActiveOrdersForUser(int $userId);
}
