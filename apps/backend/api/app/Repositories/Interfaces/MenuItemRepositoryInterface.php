<?php

namespace App\Repositories\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface MenuItemRepositoryInterface extends BaseRepositoryInterface
{
    public function listForRestaurant(array $filters, int $restaurantId): LengthAwarePaginator|Collection;
}
