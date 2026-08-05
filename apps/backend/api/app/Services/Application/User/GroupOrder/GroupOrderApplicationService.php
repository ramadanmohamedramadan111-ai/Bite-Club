<?php

namespace App\Services\Application\User\GroupOrder;

use \App\Events\GroupOrderPlaced;
use \App\Events\GroupOrderUnlocked;
use \App\Events\GroupOrderUserItemsCleared;
use App\DTOs\User\GroupOrder\ActiveGroupOrdersDto;
use App\DTOs\User\GroupOrder\AddGroupOrderItemDto;
use App\DTOs\User\GroupOrder\CancelGroupOrderDto;
use App\DTOs\User\GroupOrder\ClearGroupOrderItemsDto;
use App\DTOs\User\GroupOrder\CreateGroupOrderDto;
use App\DTOs\User\GroupOrder\GetGroupOrderDto;
use App\DTOs\User\GroupOrder\GroupOrderHistoryDto;
use App\DTOs\User\GroupOrder\GroupOrderPreviewDto;
use App\DTOs\User\GroupOrder\PlaceGroupOrderDto;
use App\DTOs\User\GroupOrder\RemoveGroupOrderItemDto;
use App\DTOs\User\GroupOrder\UnlockGroupOrderDto;
use App\DTOs\User\GroupOrder\UpdateGroupOrderItemQuantityDto;
use App\Events\GroupOrderCancelled;
use App\Events\GroupOrderItemAdded;
use App\Events\GroupOrderItemQuantityUpdated;
use App\Events\GroupOrderItemRemoved;
use App\Events\GroupOrderLocked;
use App\Models\GroupOrder;
use App\Models\GroupOrderItem;
use App\Services\Domain\User\GroupOrder\GroupOrderDomainService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

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
            $dto->getRestaurantId(),
            $dto->isAnonymous()
        );
    }

    public function addItem(AddGroupOrderItemDto $dto): GroupOrderItem
    {
        $item = $this->groupOrderDomainService->addItem(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getItemId(),
            $dto->getQuantity(),
            $dto->getNotes()
        );

        broadcast(new GroupOrderItemAdded($item, $dto->getGroupOrderId()));

        return $item;
    }

    public function removeItem(RemoveGroupOrderItemDto $dto): void
    {
        $this->groupOrderDomainService->removeItem(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getGroupOrderItemId()
        );

        broadcast(new GroupOrderItemRemoved(
            $dto->getGroupOrderItemId(),
            $dto->getGroupOrderId()
        ));
    }

    public function updateItemQuantity(UpdateGroupOrderItemQuantityDto $dto): void
    {
        $item = $this->groupOrderDomainService->updateItemQuantity(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getGroupOrderItemId(),
            $dto->getQuantity()
        );

        broadcast(new GroupOrderItemQuantityUpdated($item, $dto->getGroupOrderId()));
    }

    public function clearUserItems(ClearGroupOrderItemsDto $dto): void
    {
        $this->groupOrderDomainService->clearUserItems(
            $dto->getUserId(),
            $dto->getGroupOrderId()
        );

        broadcast(new GroupOrderUserItemsCleared(
            $dto->getUserId(),
            $dto->getGroupOrderId()
        ));
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
        $result = $this->groupOrderDomainService->previewCheckout(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getOrderType(),
            $dto->getLat(),
            $dto->getLong()
        );

        broadcast(new GroupOrderLocked($dto->getGroupOrderId()));

        return $result;
    }

    public function unlock(UnlockGroupOrderDto $dto): void
    {
        $this->groupOrderDomainService->unlock(
            $dto->getUserId(),
            $dto->getGroupOrderId()
        );

        broadcast(new GroupOrderUnlocked($dto->getGroupOrderId()));
    }

    public function cancel(CancelGroupOrderDto $dto): void
    {
        $this->groupOrderDomainService->cancel(
            $dto->getUserId(),
            $dto->getGroupOrderId()
        );

        broadcast(new GroupOrderCancelled($dto->getGroupOrderId()));
    }

    public function placeOrder(PlaceGroupOrderDto $dto): array
    {
        $result = $this->groupOrderDomainService->placeOrder(
            $dto->getUserId(),
            $dto->getGroupOrderId(),
            $dto->getOrderType(),
            $dto->getPaymentOptionId(),
            $dto->getLat(),
            $dto->getLong()
        );

        broadcast(new GroupOrderPlaced(
            $dto->getGroupOrderId(),
            $result['order_id'] ?? null
        ));

        return $result;
    }

    public function getHistory(GroupOrderHistoryDto $dto): LengthAwarePaginator
    {
        return $this->groupOrderDomainService->getHistory(
            $dto->getUserId(),
            $dto->getPage(),
            $dto->getPerPage(),
            $dto->getGroupId()
        );
    }

    public function getActiveSessions(ActiveGroupOrdersDto $dto): Collection
    {
        return $this->groupOrderDomainService->getActiveSessions(
            $dto->getUserId()
        );
    }

    public function addGuestItem(string $guestUserId, string $guestUserName, int $groupOrderId, int $itemId, int $quantity, ?string $notes): \App\Models\GroupOrderItemGuest
    {
        $item = $this->groupOrderDomainService->addGuestItem(
            $guestUserId,
            $guestUserName,
            $groupOrderId,
            $itemId,
            $quantity,
            $notes
        );

        broadcast(new GroupOrderItemAdded($item, $groupOrderId));

        return $item;
    }

    public function updateGuestItemQuantity(string|int $actorId, int $groupOrderId, int $groupOrderItemId, int $quantity): \App\Models\GroupOrderItemGuest
    {
        $item = $this->groupOrderDomainService->updateGuestItemQuantity(
            $actorId,
            $groupOrderId,
            $groupOrderItemId,
            $quantity
        );

        broadcast(new GroupOrderItemQuantityUpdated($item, $groupOrderId));

        return $item;
    }

    public function removeGuestItem(string|int $actorId, int $groupOrderId, int $groupOrderItemId): void
    {
        $this->groupOrderDomainService->removeGuestItem(
            $actorId,
            $groupOrderId,
            $groupOrderItemId
        );

        broadcast(new GroupOrderItemRemoved(
            $groupOrderItemId,
            $groupOrderId
        ));
    }

    public function clearGuestItems(string $guestUserId, int $groupOrderId): void
    {
        $this->groupOrderDomainService->clearGuestItems(
            $guestUserId,
            $groupOrderId
        );

        broadcast(new GroupOrderUserItemsCleared(
            $guestUserId,
            $groupOrderId
        ));
    }

    public function getGuestGroupOrder(int $groupOrderId): GroupOrder
    {
        return $this->groupOrderDomainService->getGuestGroupOrder($groupOrderId);
    }

    public function mergeGuestItemsAll(int $userId, array $groupOrders, string $guestUserId): void
    {
        foreach ($groupOrders as $go) {
            $groupOrderId = (int) $go['id'];
            
            $this->groupOrderDomainService->mergeGuestItems(
                $userId,
                $groupOrderId,
                $guestUserId
            );

            broadcast(new GroupOrderUserItemsCleared(
                $guestUserId,
                $groupOrderId
            ));
        }
    }
}
