<?php

namespace App\Services\Application\User;

use App\DTOs\User\SearchQueryDto;
use App\Services\Domain\User\UserDomainService;

class UserApplicationService
{
    public function __construct(
        private UserDomainService $userDomainService
    ) {}

    public function searchUsers(SearchQueryDto $dto): array
    {
        return $this->userDomainService->searchUsers($dto->getSearch());
    }
}
