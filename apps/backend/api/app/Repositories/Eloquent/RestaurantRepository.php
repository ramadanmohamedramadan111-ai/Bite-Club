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

    public function listForUser(array $filters): array
    {
        $query = $this->query()
            ->select('restaurants.*')
            ->where('restaurants.status', RestaurantStatusEnum::ACTIVE->value)
            ->join('restaurant_settings', 'restaurants.id', '=', 'restaurant_settings.restaurant_id')
            ->where('restaurant_settings.is_open', true)
            ->with(['setting', 'openingHours', 'category' => function ($q) {
                $q->select('id', 'name', 'slug');
            }]);

        if (!empty($filters['name'])) {
            $query->where('restaurants.name', 'like', '%' . $filters['name'] . '%');
        }

        if (!empty($filters['category'])) {
            if (is_numeric($filters['category'])) {
                $query->where('restaurants.category_id', (int) $filters['category']);
            } else {
                $query->whereHas('category', function ($q) use ($filters) {
                    $q->where('name', 'like', '%' . $filters['category'] . '%');
                });
            }
        }

        if (isset($filters['min_rating'])) {
            $query->where('restaurants.average_rating', '>=', (float) $filters['min_rating']);
        }

        if (isset($filters['delivery_enabled'])) {
            $query->where('restaurant_settings.delivery_enabled', $filters['delivery_enabled']);
        }

        if (isset($filters['pickup_enabled'])) {
            $query->where('restaurant_settings.pickup_enabled', $filters['pickup_enabled']);
        }

        if (isset($filters['accept_orders'])) {
            $query->where('restaurant_settings.accept_orders', $filters['accept_orders']);
        }

        if (!empty($filters['sort_by'])) {
            if ($filters['sort_by'] === 'rating') {
                $query->orderBy('restaurants.average_rating', 'desc')
                      ->orderBy('restaurants.reviews_count', 'desc');
            } elseif ($filters['sort_by'] === 'alphabetical') {
                $query->orderBy('restaurants.name', 'asc');
            }
        } else {
            $query->orderBy('restaurants.id', 'desc');
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

    public function findForUser(int $id): ?Restaurant
    {
        return $this->query()
            ->select('restaurants.*')
            ->where('restaurants.id', $id)
            ->where('restaurants.status', RestaurantStatusEnum::ACTIVE->value)
            ->join('restaurant_settings', 'restaurants.id', '=', 'restaurant_settings.restaurant_id')
            ->where('restaurant_settings.is_open', true)
            ->with(['setting', 'openingHours', 'category' => function ($q) {
                $q->select('id', 'name', 'slug');
            }])
            ->first();
    }

    public function getNearest(float $latitude, float $longitude, int $limit = 5): Collection
    {
        return $this->query()
            ->select('restaurants.*')
            ->where('status', RestaurantStatusEnum::ACTIVE->value)
            ->join('restaurant_settings', 'restaurants.id', '=', 'restaurant_settings.restaurant_id')
            ->where('restaurant_settings.is_open', true)
            ->selectRaw(
                '( 6371 * acos( cos( radians(?) ) *
                  cos( radians( restaurant_settings.latitude ) )
                  * cos( radians( restaurant_settings.longitude ) - radians(?)
                  ) + sin( radians(?) ) *
                  sin( radians( restaurant_settings.latitude ) ) )
                ) AS distance', [$latitude, $longitude, $latitude]
            )
            ->orderBy('distance')
            ->limit($limit)
            ->with('setting')
            ->get()
            ->sortBy([
                ['average_rating', 'desc'],
                ['reviews_count', 'desc']
            ])
            ->values();
    }

    public function getHighestRated(int $limit = 10): Collection
    {
        return $this->query()
            ->select('restaurants.*')
            ->where('status', RestaurantStatusEnum::ACTIVE->value)
            ->join('restaurant_settings', 'restaurants.id', '=', 'restaurant_settings.restaurant_id')
            ->where('restaurant_settings.is_open', true)
            ->orderByDesc('average_rating')
            ->orderByDesc('reviews_count')
            ->limit($limit)
            ->with('setting')
            ->get();
    }

    public function updateStats(int $restaurantId, float $averageRating, int $reviewsCount): bool
    {
        return $this->update($restaurantId, [
            'average_rating' => $averageRating,
            'reviews_count'  => $reviewsCount,
        ]);
    }
}
