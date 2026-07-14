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
}
