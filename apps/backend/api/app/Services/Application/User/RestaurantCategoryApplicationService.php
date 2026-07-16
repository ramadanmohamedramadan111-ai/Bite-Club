<?php

namespace App\Services\Application\User;

use App\DTOs\User\RestaurantCategory\IndexRestaurantCategoryDto;
use App\Services\Domain\RestaurantCategory\RestaurantCategoryDomainService;

class RestaurantCategoryApplicationService
{
    public function __construct(
        private RestaurantCategoryDomainService $restaurantCategoryDomainService
    ) {}

    public function index(IndexRestaurantCategoryDto $dto): array
    {
        $data = $this->restaurantCategoryDomainService->list($dto->toArray());

        return [
            'items' => $data['items']->map(fn($item) => $this->mapItem($item))->toArray(),
        ];
    }

    private function mapItem($category): array
    {
        return [
            'id'        => $category->id,
            'name'      => $category->name,
            'slug'      => $category->slug,
            'image_url' => $category->image_url,
        ];
    }
}
