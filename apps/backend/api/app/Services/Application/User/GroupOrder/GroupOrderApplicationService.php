<?php

namespace App\Services\Application\User\GroupOrder;

use App\DTOs\User\GroupOrder\CreateGroupOrderDto;
use App\Models\GroupOrder;
use App\Services\Domain\User\GroupOrder\GroupOrderDomainService;

class GroupOrderApplicationService
{
    public function __construct(
        private GroupOrderDomainService $groupOrderDomainService
    ) {}

    public function createGroupOrder(CreateGroupOrderDto $dto): GroupOrder
    {
        return $this->groupOrderDomainService->createGroupOrder(
            $dto->getHostId(),
            $dto->getGroupId(),
            $dto->getRestaurantId()
        );
    }
}
