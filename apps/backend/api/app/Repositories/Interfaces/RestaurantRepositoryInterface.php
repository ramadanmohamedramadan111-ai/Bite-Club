<?php

namespace App\Repositories\Interfaces;

use App\Models\Restaurant;

interface RestaurantRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email): ?Restaurant;
    public function findByPhone(string $phone): ?Restaurant;
}
