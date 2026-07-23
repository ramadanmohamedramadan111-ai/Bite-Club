<?php

namespace App\Services\Application\User\GroupOrder;

use App\DTOs\User\GroupOrder\CreateGroupOrderDto;
use App\DTOs\User\GroupOrder\AddGroupOrderItemDto;
use App\DTOs\User\GroupOrder\RemoveGroupOrderItemDto;
use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
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

    public function addItem(AddGroupOrderItemDto $dto): GroupOrderItem
    {
        return $this->groupOrderDomainService->addItem(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getItemId(),
            $dto->getQuantity(),
            $dto->getNotes()
        );
    }

    public function removeItem(RemoveGroupOrderItemDto $dto): void
    {
        $this->groupOrderDomainService->removeItem(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getGroupOrderItemId()
        );
    }
}
