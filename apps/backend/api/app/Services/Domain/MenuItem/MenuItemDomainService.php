<?php

namespace App\Services\Domain\MenuItem;

use App\Models\MenuItem;
use App\Repositories\Interfaces\MenuItemRepositoryInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MenuItemDomainService
{
    public function __construct(
        private MenuItemRepositoryInterface $menuItemRepository
    ) {}

    public function list(array $filters, int $restaurantId): array
    {
        $paginatorOrCollection = $this->menuItemRepository->listForRestaurant($filters, $restaurantId);

        if ($paginatorOrCollection instanceof \Illuminate\Database\Eloquent\Collection) {
            return [
                'items' => $paginatorOrCollection,
            ];
        }

        return [
            'items' => collect($paginatorOrCollection->items()),
            'meta' => [
                'current_page' => $paginatorOrCollection->currentPage(),
                'last_page'    => $paginatorOrCollection->lastPage(),
                'per_page'     => $paginatorOrCollection->perPage(),
                'total'        => $paginatorOrCollection->total(),
            ]
        ];
    }

    public function findOrFailForRestaurant(int $id, int $restaurantId): MenuItem
    {
        $item = $this->menuItemRepository->findOrFail($id, ['*'], ['menuCategory']);
        if ($item->menuCategory->restaurant_id !== $restaurantId) {
            throw new ModelNotFoundException("Menu Item not found");
        }
        return $item;
    }

    public function create(array $data): MenuItem
    {
        return $this->menuItemRepository->create($data);
    }

    public function update(int $id, int $restaurantId, array $data): MenuItem
    {
        $item = $this->findOrFailForRestaurant($id, $restaurantId);
        $this->menuItemRepository->update($item->id, $data);
        return $this->findOrFailForRestaurant($item->id, $restaurantId);
    }

    public function delete(int $id, int $restaurantId): MenuItem
    {
        $item = $this->findOrFailForRestaurant($id, $restaurantId);
        $this->menuItemRepository->delete($item->id);
        
        return $item; // Returning item so the application service can delete the image file
    }
}
