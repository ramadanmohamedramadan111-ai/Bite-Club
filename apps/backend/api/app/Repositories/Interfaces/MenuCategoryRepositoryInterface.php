<?php

namespace App\Repositories\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface MenuCategoryRepositoryInterface extends BaseRepositoryInterface
{
    public function listWithCounts(array $filters, int $restaurantId): LengthAwarePaginator|Collection;
}
