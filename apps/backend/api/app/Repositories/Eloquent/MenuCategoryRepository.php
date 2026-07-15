<?php

namespace App\Repositories\Eloquent;

use App\Models\MenuCategory;
use App\Repositories\Interfaces\MenuCategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

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
                'items as active_items' => fn($q) => $q->where('is_available', true)
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
}
