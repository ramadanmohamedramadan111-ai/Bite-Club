<?php

namespace App\Repositories\Eloquent;

use App\Models\RestaurantReview;
use App\Repositories\Interfaces\RestaurantReviewRepositoryInterface;
use Illuminate\Support\Facades\DB;

class RestaurantReviewRepository extends BaseRepository implements RestaurantReviewRepositoryInterface
{
    public function __construct(RestaurantReview $model)
    {
        parent::__construct($model);
    }

    public function findByUserAndRestaurant(int $userId, int $restaurantId): ?RestaurantReview
    {
        return $this->query()
            ->where('user_id', $userId)
            ->where('restaurant_id', $restaurantId)
            ->first();
    }

    public function listByRestaurant(int $restaurantId, array $filters): array
    {
        $query = $this->query()
            ->with(['user' => function($q) {
                $q->select('id', 'first_name', 'last_name', 'profile_image_url');
            }])
            ->where('restaurant_id', $restaurantId)
            ->orderBy('id', 'desc');

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

    public function calculateAverageRatingAndCount(int $restaurantId): array
    {
        $result = $this->query()
            ->where('restaurant_id', $restaurantId)
            ->select(
                DB::raw('COUNT(id) as total_count'),
                DB::raw('AVG(rating) as average_rating')
            )
            ->first();

        return [
            'count'   => (int) ($result->total_count ?? 0),
            'average' => (float) ($result->average_rating ?? 0.0),
        ];
    }
}
