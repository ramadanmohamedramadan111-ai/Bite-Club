<?php

namespace App\Services\Domain\User\Restaurant;

use App\Repositories\Interfaces\MenuCategoryRepositoryInterface;

class RestaurantMenuDomainService
{
    public function __construct(
        private readonly MenuCategoryRepositoryInterface $menuCategoryRepository
    ) {}

    public function listMenuForUser(int $restaurantId, array $filters): array
    {
        return $this->menuCategoryRepository->listWithItemsForUser($restaurantId, $filters);
    }
}
