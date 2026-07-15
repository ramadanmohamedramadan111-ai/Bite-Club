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
        $paginator = $this->userDomainService->searchUsers($dto->getSearch(), $dto->getPerPage());
        return [
            'items' => $paginator->items(),
            'meta'  => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ];
    }
}
