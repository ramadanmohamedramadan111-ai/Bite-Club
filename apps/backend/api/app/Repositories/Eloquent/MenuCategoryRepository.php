<?php

namespace App\Repositories\Eloquent;

use App\Models\MenuCategory;
use App\Repositories\Interfaces\MenuCategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class MenuCategoryRepository extends BaseRepository implements MenuCategoryRepositoryInterface
{
    public function __construct(MenuCategory $model)
    {
        parent::__construct($model);
    }

    public function listWithCounts(array $filters, int $restaurantId): LengthAwarePaginator|Collection
    {
        $query = $this->query()
            ->where('restaurant_id', $restaurantId)
            ->withCount([
                'items as total_items',
                'items as active_items' => fn($q) => $q->where('availability', MenuItemAvailabilityEnum::AVAILABLE->value)
            ])
            ->orderBy('id', 'desc');

        if (isset($filters['title']) && !empty($filters['title'])) {
            $query->where('title', 'LIKE', '%' . $filters['title'] . '%');
        }

        if (isset($filters['all']) && filter_var($filters['all'], FILTER_VALIDATE_BOOLEAN)) {
            return $query->get();
        }

        $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 15;
        return $query->paginate($perPage);
    }

    public function listWithItemsForUser(int $restaurantId, array $filters): array
    {
        $query = $this->query()
            ->where('restaurant_id', $restaurantId)
            ->where('visibility', MenuCategoryVisibilityEnum::VISIBLE->value)
            ->withCount([
                'items as active_items_count' => fn($q) => $q->where('availability', MenuItemAvailabilityEnum::AVAILABLE->value)
            ])
            ->whereHas('items', function ($q) {
                $q->where('availability', MenuItemAvailabilityEnum::AVAILABLE->value);
            })
            ->with(['items' => function ($q) use ($filters) {
                $q->where('availability', MenuItemAvailabilityEnum::AVAILABLE->value);
                if (!empty($filters['item_title'])) {
                    $q->where('title', 'LIKE', '%' . $filters['item_title'] . '%');
                }
            }])
            ->orderBy('id', 'desc');

        if (!empty($filters['category'])) {
            if (is_numeric($filters['category'])) {
                $query->where('id', (int) $filters['category']);
            } else {
                $query->where('title', 'LIKE', '%' . $filters['category'] . '%');
            }
        }

        if (!empty($filters['item_title'])) {
            $query->whereHas('items', function ($q) use ($filters) {
                $q->where('availability', MenuItemAvailabilityEnum::AVAILABLE->value)
                  ->where('title', 'LIKE', '%' . $filters['item_title'] . '%');
            });
        }

        $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 15;
        $paginator = $query->paginate($perPage);

        return [
            'items' => collect($paginator->items()),
            'meta'  => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ];
    }
}
