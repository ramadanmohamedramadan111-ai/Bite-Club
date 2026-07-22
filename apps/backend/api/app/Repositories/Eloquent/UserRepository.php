<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->findBy('email', $email);
    }

    public function findByUsername(string $username): ?User
    {
        return $this->findBy('username', $username);
    }

    public function findByPhoneNumber(string $phoneNumber): ?User
    {
        return $this->findBy('phone_number', $phoneNumber);
    }

    public function findByReferralCode(string $referralCode): ?User
    {
        return $this->findBy('referral_code', $referralCode);
    }

    public function updateLastLogin(int $id): void
    {
        $this->update($id, [
            'last_login_at' => now(),
        ]);
    }

    public function listForAdmin(array $filters): array
    {
        $query = $this->query()->orderBy('id', 'desc');

        if (!empty($filters['username'])) {
            $query->where('username', 'like', '%' . $filters['username'] . '%');
        }

        if (!empty($filters['full_name'])) {
            $query->where(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', '%' . $filters['full_name'] . '%');
        }

        if (!empty($filters['email'])) {
            $query->where('email', 'like', '%' . $filters['email'] . '%');
        }

        if (!empty($filters['phone_number'])) {
            $query->where('phone_number', 'like', '%' . $filters['phone_number'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
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

    public function getDashboardStats(): array
    {
        return [
            'total_users'           => $this->query()->count(),
            'new_users_this_month'  => $this->query()->where('created_at', '>=', now()->startOfMonth())->count(),
            'verified_users'        => $this->query()->whereNotNull('email_verified_at')->count(),
            'unverified_users'      => $this->query()->whereNull('email_verified_at')->count(),
        ];
    }
}
