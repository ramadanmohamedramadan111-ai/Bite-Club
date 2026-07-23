<?php

namespace App\Services\Application\Loyalty;

use App\Services\Domain\Loyalty\ReferralDomainService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReferralApplicationService
{
    public function __construct(
        private readonly ReferralDomainService $referralDomainService
    ) {}

    public function getReferrals(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->referralDomainService->getReferrals($userId, $perPage);
    }
}
