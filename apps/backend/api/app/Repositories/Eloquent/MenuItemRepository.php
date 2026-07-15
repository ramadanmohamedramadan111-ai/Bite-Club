<?php

namespace App\Repositories\Eloquent;

use App\Models\MenuItem;
use App\Repositories\Interfaces\MenuItemRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MenuItemRepository extends BaseRepository implements MenuItemRepositoryInterface
{
    public function __construct(MenuItem $model)
    {
        parent::__construct($model);
    }

    public function listForRestaurant(array $filters, int $restaurantId): LengthAwarePaginator|Collection
    {
        $query = $this->query()
            ->whereHas('menuCategory', function ($q) use ($restaurantId) {
                $q->where('restaurant_id', $restaurantId);
            })
            ->with('menuCategory');

        if (isset($filters['title']) && !empty($filters['title'])) {
            $query->where('title', 'LIKE', '%' . $filters['title'] . '%');
        }

        if (isset($filters['menu_category_id']) && !empty($filters['menu_category_id'])) {
            $query->where('menu_category_id', $filters['menu_category_id']);
        }

        $sortBy = $filters['sort_by'] ?? 'id';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        if (isset($filters['all']) && filter_var($filters['all'], FILTER_VALIDATE_BOOLEAN)) {
            return $query->get();
        }

        $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 15;
        return $query->paginate($perPage);
    }
}
