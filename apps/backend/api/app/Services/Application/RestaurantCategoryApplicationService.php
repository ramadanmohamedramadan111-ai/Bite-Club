<?php

namespace App\Services\Application;

use App\DTOs\RestaurantCategory\IndexRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\ShowRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\StoreRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\UpdateRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\DestroyRestaurantCategoryDto;
use App\Services\Domain\RestaurantCategory\RestaurantCategoryDomainService;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;
use App\Traits\FileUploadTrait;

class RestaurantCategoryApplicationService
{
    use FileUploadTrait;
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
        $data = $dto->toArray();

        if ($dto->getImage()) {
            $data['image_url'] = $this->uploadFile($dto->getImage(), 'restaurant_categories');
        }

        $category = $this->restaurantCategoryDomainService->create($data);
        return $this->mapItem($category);
    }

    public function update(UpdateRestaurantCategoryDto $dto): array
    {
        $data = $dto->toArray();

        if ($dto->getImage()) {
            $oldCategory = $this->restaurantCategoryDomainService->findOrFail($dto->getId());
            if (!empty($oldCategory->image_url)) {
                $this->deleteFile($oldCategory->image_url);
            }
            $data['image_url'] = $this->uploadFile($dto->getImage(), 'restaurant_categories');
        }

        $category = $this->restaurantCategoryDomainService->update($dto->getId(), $data);
        return $this->mapItem($category);
    }

    public function destroy(DestroyRestaurantCategoryDto $dto): void
    {
        $category = $this->restaurantCategoryDomainService->findOrFail($dto->getId());
        if (!empty($category->image_url)) {
            $this->deleteFile($category->image_url);
        }
        $this->restaurantCategoryDomainService->delete($dto->getId());
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
