<?php

namespace App\Services\Domain\OrderPayment;

use App\Repositories\Interfaces\OrderPaymentRepositoryInterface;

class OrderPaymentDomainService
{
    public function __construct(
        private readonly OrderPaymentRepositoryInterface $orderPaymentRepository
    ) {}

    public function listRestaurantPayments(int $restaurantId, array $filters, int $perPage = 15): array
    {
        return $this->orderPaymentRepository->listRestaurantPayments($restaurantId, $filters, $perPage);
    }

    public function getRestaurantStatistics(int $restaurantId): array
    {
        return $this->orderPaymentRepository->getRestaurantStatistics($restaurantId);
    }
}
