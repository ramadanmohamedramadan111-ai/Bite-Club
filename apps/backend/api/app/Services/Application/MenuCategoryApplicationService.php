<?php

namespace App\Services\Application;

use App\DTOs\MenuCategory\IndexMenuCategoryDto;
use App\DTOs\MenuCategory\StoreMenuCategoryDto;
use App\DTOs\MenuCategory\UpdateMenuCategoryDto;
use App\DTOs\MenuCategory\UpdateMenuCategoryVisibilityDto;
use App\DTOs\MenuCategory\DestroyMenuCategoryDto;
use App\Services\Domain\MenuCategory\MenuCategoryDomainService;

class MenuCategoryApplicationService
{
    public function __construct(
        private MenuCategoryDomainService $menuCategoryDomainService
    ) {}

    public function index(IndexMenuCategoryDto $dto): array
    {
   
        $restaurantId = auth('restaurant')->id();
        $data = $this->menuCategoryDomainService->list($dto->toArray(), $restaurantId);

        return array_filter([
            'items' => $data['items']->map(fn($item) => $this->mapItem($item))->toArray(),
            'meta'  => $data['meta'] ?? null,
        ]);
    }

    public function store(StoreMenuCategoryDto $dto): array
    {
        $category = $this->menuCategoryDomainService->create($dto->toArray());
        return $this->mapItem($category);
    }

    public function update(UpdateMenuCategoryDto $dto): array
    {
        $category = $this->menuCategoryDomainService->update($dto->getId(), $dto->getRestaurantId(), $dto->toArray());
        return $this->mapItem($category);
    }

    public function updateVisibility(UpdateMenuCategoryVisibilityDto $dto): array
    {
        $category = $this->menuCategoryDomainService->update($dto->getId(), $dto->getRestaurantId(), $dto->toArray());
        return $this->mapItem($category);
    }

    public function destroy(DestroyMenuCategoryDto $dto): void
    {
        $this->menuCategoryDomainService->delete($dto->getId(), $dto->getRestaurantId());
    }

    private function mapItem($category): array
    {
        return [
            'id'                => $category->id,
            'title'             => $category->title,
            'icon_name'         => $category->icon_name,
            'short_description' => $category->short_description,
            'visibility'        => $category->visibility->value ?? $category->visibility,
            'total_items'       => $category->total_items ?? 0,
            'active_items'      => $category->active_items ?? 0,
        ];
    }
}
