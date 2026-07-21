<?php

namespace App\Repositories\Interfaces;

interface UserBanRepositoryInterface extends BaseRepositoryInterface
{
    public function listActiveBans(array $filters): array;
}
