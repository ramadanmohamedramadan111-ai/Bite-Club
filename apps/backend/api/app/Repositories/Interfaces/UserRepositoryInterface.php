<?php

namespace App\Repositories\Interfaces;

use App\Models\User;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function findByUsername(string $username): ?User;

    public function findByPhoneNumber(string $phoneNumber): ?User;

    public function findByReferralCode(string $referralCode): ?User;

    public function updateLastLogin(int $id): void;
}