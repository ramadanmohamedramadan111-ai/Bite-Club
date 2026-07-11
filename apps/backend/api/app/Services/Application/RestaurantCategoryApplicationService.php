<?php

namespace App\Services\Application;

use App\DTOs\RestaurantCategory\IndexRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\ShowRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\StoreRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\UpdateRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\DestroyRestaurantCategoryDto;
use App\Services\Domain\RestaurantCategory\RestaurantCategoryDomainService;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;

class RestaurantCategoryApplicationService
{
    public function __construct(
        private RestaurantCategoryDomainService $restaurantCategoryDomainService,
        private RestaurantCategoryRepositoryInterface $restaurantCategoryRepository
    ) {}

    public function index(IndexRestaurantCategoryDto $dto): array
    {
        $data = $this->restaurantCategoryDomainService->list($dto->toArray());

        return array_filter([
            'items' => $data['items']->map(fn($item) => $this->mapItem($item))->toArray(),
            'meta'  => $data['meta'] ?? null,
        ]);
    }

    public function show(ShowRestaurantCategoryDto $dto): array
    {
        $category = $this->restaurantCategoryDomainService->findOrFail($dto->getId());
        return $this->mapItem($category);
    }

    public function store(StoreRestaurantCategoryDto $dto): array
    {
        $category = $this->restaurantCategoryDomainService->create($dto->toArray());
        return $this->mapItem($category);
    }

    public function update(UpdateRestaurantCategoryDto $dto): array
    {
        $category = $this->restaurantCategoryDomainService->update($dto->getId(), $dto->toArray());
        return $this->mapItem($category);
    }

    public function destroy(DestroyRestaurantCategoryDto $dto): void
    {
        $this->restaurantCategoryDomainService->delete($dto->getId());
    }

    private function mapItem($category): array
    {
        return [
            'id'   => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
        ];
    }
}
