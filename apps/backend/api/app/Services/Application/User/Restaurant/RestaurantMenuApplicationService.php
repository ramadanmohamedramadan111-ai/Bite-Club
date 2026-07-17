<?php

namespace App\Services\Application\User\Restaurant;

use App\DTOs\User\Restaurant\ListMenuDto;
use App\Http\Resources\User\Restaurant\MenuCategoryResource;
use App\Services\Domain\User\Restaurant\RestaurantDomainService;
use App\Services\Domain\User\Restaurant\RestaurantMenuDomainService;

class RestaurantMenuApplicationService
{
    public function __construct(
        private readonly RestaurantDomainService $restaurantDomainService,
        private readonly RestaurantMenuDomainService $restaurantMenuDomainService
    ) {}

    public function listMenu(ListMenuDto $dto): array
    {
        $restaurantId = $dto->getRestaurantId();
        
        // Ensure restaurant exists and is active/open for the user
        $this->restaurantDomainService->getRestaurantForUser($restaurantId);

        $result = $this->restaurantMenuDomainService->listMenuForUser($restaurantId, $dto->getFilters());

        return [
            'items' => MenuCategoryResource::collection($result['items']),
            'meta'  => $result['meta'],
        ];
    }
}
