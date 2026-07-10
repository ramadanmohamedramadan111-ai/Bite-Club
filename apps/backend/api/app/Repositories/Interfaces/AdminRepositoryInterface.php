<?php

namespace App\Repositories\Interfaces;

use App\Models\Admin;

interface AdminRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email): ?Admin;
    public function updateLastLogin(int $id): void;
}
