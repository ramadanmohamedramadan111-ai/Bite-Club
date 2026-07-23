<?php

namespace App\Services\Application\Loyalty;

use App\Services\Domain\Loyalty\WalletDomainService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class WalletApplicationService
{
    public function __construct(
        private readonly WalletDomainService $walletDomainService
    ) {}

    public function getBalance(int $userId): int
    {
        return $this->walletDomainService->getBalance($userId);
    }

    public function getTransactions(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->walletDomainService->getTransactions($userId, $perPage);
    }
}
