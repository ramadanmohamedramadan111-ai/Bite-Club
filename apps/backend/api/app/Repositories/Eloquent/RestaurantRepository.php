<?php

namespace App\Repositories\Eloquent;

use App\Models\Restaurant;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;

class RestaurantRepository extends BaseRepository implements RestaurantRepositoryInterface
{
    public function __construct(Restaurant $model)
    {
        parent::__construct($model);
    }

    public function findByEmail(string $email): ?Restaurant
    {
        return $this->findBy('email', $email);
    }

    public function findByPhone(string $phone): ?Restaurant
    {
        return $this->findBy('phone_number', $phone);
    }

    public function updateLastLogin(int $id): void
    {
        $this->update($id, ['last_login_at' => now()]);
    }
}
