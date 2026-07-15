<?php

namespace App\Services\Domain\MenuCategory;

use App\Models\MenuCategory;
use App\Repositories\Interfaces\MenuCategoryRepositoryInterface;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MenuCategoryDomainService
{
    public function __construct(
        private MenuCategoryRepositoryInterface $menuCategoryRepository
    ) {}

    public function list(array $filters, int $restaurantId): array
    {
        $paginatorOrCollection = $this->menuCategoryRepository->listWithCounts($filters, $restaurantId);

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

    public function findOrFailForRestaurant(int $id, int $restaurantId): MenuCategory
    {
        $category = $this->menuCategoryRepository->findOrFail($id);
        if ($category->restaurant_id !== $restaurantId) {
            throw new ModelNotFoundException("Menu Category not found");
        }
        return $category;
    }

    public function create(array $data): MenuCategory
    {
        return $this->menuCategoryRepository->create($data);
    }

    public function update(int $id, int $restaurantId, array $data): MenuCategory
    {
        $category = $this->findOrFailForRestaurant($id, $restaurantId);
        $this->menuCategoryRepository->update($category->id, $data);
        return $this->findOrFailForRestaurant($category->id, $restaurantId);
    }

    public function delete(int $id, int $restaurantId): void
    {
        $category = $this->findOrFailForRestaurant($id, $restaurantId);
        
        // Ensure category has no items before deleting
        if ($category->items()->count() > 0) {
            throw new Exception(trans('menu_category.has_items'));
        }

        $this->menuCategoryRepository->delete($category->id);
    }
}
