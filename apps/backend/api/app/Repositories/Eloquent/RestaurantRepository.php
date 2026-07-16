<?php

namespace App\Repositories\Eloquent;

use App\Models\Restaurant;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use App\Enums\Restaurant\RestaurantStatusEnum;
use Illuminate\Support\Collection;

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

    public function listForAdmin(array $filters): array
    {
        $query = $this->query()
            ->with([
                'category' => function ($query) {
                    $query->select('id', 'name', 'slug');
                },
            ])
            ->orderBy('id', 'desc');

        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (!empty($filters['category'])) {
            if (is_numeric($filters['category'])) {
                $query->where('category_id', (int) $filters['category']);
            } else {
                $query->whereHas('category', function ($query) use ($filters) {
                    $query->where('name', 'like', '%' . $filters['category'] . '%');
                });
            }
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['all']) && filter_var($filters['all'], FILTER_VALIDATE_BOOLEAN) === true) {
            return [
                'items' => $query->get(),
            ];
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

    public function getNearest(float $latitude, float $longitude, int $limit = 5): Collection
    {
        return $this->query()
            ->select('restaurants.*')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(restaurant_settings.latitude)) * cos(radians(restaurant_settings.longitude) - radians(?)) + sin(radians(?)) * sin(radians(restaurant_settings.latitude)))) AS distance',
                [$latitude, $longitude, $latitude]
            )
            ->join('restaurant_settings', 'restaurants.id', '=', 'restaurant_settings.restaurant_id')
            ->with('setting') 
            ->where('restaurants.status', RestaurantStatusEnum::ACTIVE->value)
            ->where('restaurant_settings.is_open', true)
            ->orderBy('distance')
            ->limit($limit)
            ->get();
    }
}
