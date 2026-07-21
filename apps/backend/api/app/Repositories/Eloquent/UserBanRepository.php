<?php

namespace App\Repositories\Eloquent;

use App\Models\UserBan;
use App\Repositories\Interfaces\UserBanRepositoryInterface;

class UserBanRepository extends BaseRepository implements UserBanRepositoryInterface
{
    public function __construct(UserBan $model)
    {
        parent::__construct($model);
    }

    public function listActiveBans(array $filters): array
    {
        $query = $this->query()
            ->whereNull('lifted_at')
            ->orderBy('banned_at', 'desc')
            ->with(['user', 'bannedBy']);

        if (!empty($filters['username'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('username', 'like', '%' . $filters['username'] . '%');
            });
        }

        if (!empty($filters['email'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('email', 'like', '%' . $filters['email'] . '%');
            });
        }

        if (!empty($filters['search'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('username', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
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
