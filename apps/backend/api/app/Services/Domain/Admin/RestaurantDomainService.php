<?php

namespace App\Services\Domain\Admin;

use App\Repositories\Interfaces\RestaurantRepositoryInterface;

class RestaurantDomainService
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository
    ) {}

    public function list(array $filters): array
    {
        return $this->restaurantRepository->listForAdmin($filters);
    }
}
