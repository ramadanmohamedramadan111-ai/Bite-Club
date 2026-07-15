<?php

namespace App\Services\Application;

use App\DTOs\MenuItem\IndexMenuItemDto;
use App\DTOs\MenuItem\StoreMenuItemDto;
use App\DTOs\MenuItem\UpdateMenuItemDto;
use App\DTOs\MenuItem\UpdateMenuItemAvailabilityDto;
use App\DTOs\MenuItem\DestroyMenuItemDto;
use App\Services\Domain\MenuItem\MenuItemDomainService;
use App\Services\Domain\MenuCategory\MenuCategoryDomainService;
use App\Traits\FileUploadTrait;

class MenuItemApplicationService
{
    use FileUploadTrait;

    public function __construct(
        private MenuItemDomainService $menuItemDomainService,
        private MenuCategoryDomainService $menuCategoryDomainService
    ) {}

    public function index(IndexMenuItemDto $dto): array
    {
        $data = $this->menuItemDomainService->list($dto->getFilters(), $dto->getRestaurantId());

        return array_filter([
            'items' => $data['items']->map(fn($item) => $this->mapItem($item))->toArray(),
            'meta'  => $data['meta'] ?? null,
        ]);
    }

    public function store(StoreMenuItemDto $dto): array
    {

        $this->menuCategoryDomainService->findOrFailForRestaurant($dto->getMenuCategoryId(), $dto->getRestaurantId());


        $imageUrl = $this->uploadFile($dto->getImage(), 'menu_items');


        $data = $dto->toArray();
        $data['image_url'] = $imageUrl;

        $item = $this->menuItemDomainService->create($data);
        return $this->mapItem($item);
    }

    public function update(UpdateMenuItemDto $dto): array
    {

        $this->menuCategoryDomainService->findOrFailForRestaurant($dto->getMenuCategoryId(), $dto->getRestaurantId());

        $data = $dto->toArray();


        if ($dto->getImage()) {

            $oldItem = $this->menuItemDomainService->findOrFailForRestaurant($dto->getId(), $dto->getRestaurantId());
            $this->deleteFile($oldItem->image_url);


            $data['image_url'] = $this->uploadFile($dto->getImage(), 'menu_items');
        }

        $item = $this->menuItemDomainService->update($dto->getId(), $dto->getRestaurantId(), $data);
        return $this->mapItem($item);
    }

    public function updateAvailability(UpdateMenuItemAvailabilityDto $dto): array
    {
        $item = $this->menuItemDomainService->update($dto->getId(), $dto->getRestaurantId(), $dto->toArray());
        return $this->mapItem($item);
    }

    public function destroy(DestroyMenuItemDto $dto): void
    {
        $item = $this->menuItemDomainService->delete($dto->getId(), $dto->getRestaurantId());

       
        $this->deleteFile($item->image_url);
    }

    private function mapItem($item): array
    {
        return [
            'id'               => $item->id,
            'menu_category_id' => $item->menu_category_id,
            'title'            => $item->title,
            'description'      => $item->description,
            'image_url'        => $item->image_url,
            'price'            => (float) $item->price,
            'availability'     => $item->availability->value ?? $item->availability,
            'category'         => $item->relationLoaded('menuCategory') ? [
                'id'    => $item->menuCategory->id,
                'title' => $item->menuCategory->title,
            ] : null,
        ];
    }
}
