<?php

namespace App\Repositories\Interfaces;

interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    public function getLiveOrdersForRestaurant(int $restaurantId);
    public function findOrderForRestaurant(int $orderId, int $restaurantId);
}
