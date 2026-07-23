<?php

namespace App\Services\Application\User\GroupOrder;

use App\DTOs\User\GroupOrder\CreateGroupOrderDto;
use App\DTOs\User\GroupOrder\AddGroupOrderItemDto;
use App\DTOs\User\GroupOrder\RemoveGroupOrderItemDto;
use App\DTOs\User\GroupOrder\UpdateGroupOrderItemQuantityDto;
use App\DTOs\User\GroupOrder\GetGroupOrderDto;
use App\DTOs\User\GroupOrder\GroupOrderPreviewDto;
use App\DTOs\User\GroupOrder\UnlockGroupOrderDto;
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

    public function updateItemQuantity(UpdateGroupOrderItemQuantityDto $dto): void
    {
        $this->groupOrderDomainService->updateItemQuantity(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getGroupOrderItemId(),
            $dto->getQuantity()
        );
    }

    public function getGroupOrder(GetGroupOrderDto $dto): GroupOrder
    {
        return $this->groupOrderDomainService->getGroupOrder(
            $dto->getUserId(),
            $dto->getGroupOrderId()
        );
    }

    public function previewCheckout(GroupOrderPreviewDto $dto): array
    {
        return $this->groupOrderDomainService->previewCheckout(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getOrderType(),
            $dto->getLat(),
            $dto->getLong()
        );
    }

    public function unlock(UnlockGroupOrderDto $dto): void
    {
        $this->groupOrderDomainService->unlock(
            $dto->getUserId(),
            $dto->getGroupOrderId()
        );
    }
}
