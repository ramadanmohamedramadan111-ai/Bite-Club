<?php

namespace App\Services\Domain\RestaurantCategory;

use App\Models\RestaurantCategory;
use App\Repositories\Interfaces\RestaurantCategoryRepositoryInterface;

class RestaurantCategoryDomainService
{
    public function __construct(
        private RestaurantCategoryRepositoryInterface $restaurantCategoryRepository
    ) {}

    public function list(array $filters): array
    {
        $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 15;

        if (isset($filters['all']) && filter_var($filters['all'], FILTER_VALIDATE_BOOLEAN) === true) {
            $categories = $this->restaurantCategoryRepository->get(orderBy: ['id' => 'desc']);
            return [
                'items' => $categories
            ];
        }

        $paginator = $this->restaurantCategoryRepository->paginate(
            perPage: $perPage,
            orderBy: ['id' => 'desc']
        );

        return [
            'items' => collect($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ];
    }

    public function findOrFail(int $id): RestaurantCategory
    {
        return $this->restaurantCategoryRepository->findOrFail($id);
    }

    public function create(array $data): RestaurantCategory
    {
        return $this->restaurantCategoryRepository->create($data);
    }

    public function update(int $id, array $data): RestaurantCategory
    {
        $this->restaurantCategoryRepository->update($id, $data);
        return $this->findOrFail($id);
    }

    public function delete(int $id): void
    {
        $this->restaurantCategoryRepository->delete($id);
    }
}
