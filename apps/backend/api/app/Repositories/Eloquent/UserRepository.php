<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;

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
}