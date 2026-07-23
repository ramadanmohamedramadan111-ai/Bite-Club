<?php

namespace App\Services\Domain\User\GroupOrder;

use App\Models\GroupOrder;
use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Repositories\Interfaces\GroupOrderItemRepositoryInterface;
use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Repositories\Interfaces\CartItemRepositoryInterface;
use App\Repositories\Interfaces\User\GroupMemberRepositoryInterface;
use App\Repositories\Interfaces\MenuItemRepositoryInterface;
use App\Services\Domain\User\Order\OrderDomainService;
use App\Models\GroupOrderItem;
use Exception;
use App\Enums\GroupOrder\GroupOrderStatusEnum;
use Illuminate\Support\Facades\DB;

class GroupOrderDomainService
{
    public function __construct(
        private GroupOrderRepositoryInterface $groupOrderRepo,
        private GroupOrderItemRepositoryInterface $groupOrderItemRepo,
        private CartRepositoryInterface $cartRepo,
        private CartItemRepositoryInterface $cartItemRepo,
        private GroupMemberRepositoryInterface $groupMemberRepo,
        private MenuItemRepositoryInterface $menuItemRepo,
        private OrderDomainService $orderDomainService
    ) {}

    public function createGroupOrder(int $hostId, int $groupId, int $restaurantId): GroupOrder
    {
        // 1. Check if the host is a member of the group
        $isMember = $this->groupMemberRepo->query()
            ->where('group_id', $groupId)
            ->where('user_id', $hostId)
            ->exists();

        if (!$isMember) {
            throw new Exception(trans('group_order.not_member'));
        }

        // 2. Check if there is already an active group order for this group
        $existingOrder = $this->groupOrderRepo->findActiveGroupOrderForGroup($groupId);

        if ($existingOrder) {
            throw new Exception(trans('group_order.active_order_exists'));
        }

        // 3. Create the group order
        return $this->groupOrderRepo->create([
            'group_id'      => $groupId,
            'host_id'       => $hostId,
            'restaurant_id' => $restaurantId,
            'status'        => GroupOrderStatusEnum::OPEN->value,
        ]);
    }

    public function addItem(int $userId, int $groupOrderId, int $itemId, int $quantity, ?string $notes): GroupOrderItem
    {
        $groupOrder = $this->groupOrderRepo->findOrFail($groupOrderId);

        // 1. Check if the order is still OPEN
        if ($groupOrder->status !== GroupOrderStatusEnum::OPEN) {
            throw new Exception(trans('group_order.order_not_open'));
        }

        // 2. Check if the user is a member of the group
        $isMember = $this->groupMemberRepo->query()
            ->where('group_id', $groupOrder->group_id)
            ->where('user_id', $userId)
            ->exists();

        if (!$isMember) {
            throw new Exception(trans('group_order.not_member'));
        }

        // 3. Check if the item belongs to the same restaurant
        $menuItem = $this->menuItemRepo->findOrFail($itemId);
        if ($menuItem->menuCategory->restaurant_id !== $groupOrder->restaurant_id) {
            throw new Exception(trans('group_order.item_not_in_restaurant'));
        }

        // 4. Check if the user already has this exact item with same notes
        $existingItem = $this->groupOrderItemRepo->query()
            ->where('group_order_id', $groupOrderId)
            ->where('user_id', $userId)
            ->where('item_id', $itemId)
            ->first();

        if ($existingItem) {
            // Update quantity instead of creating a new row
            $newQuantity = $existingItem->quantity + $quantity;
            $this->groupOrderItemRepo->update($existingItem->id, ['quantity' => $newQuantity,'notes' => $notes]);
            return $this->groupOrderItemRepo->findOrFail($existingItem->id);
        }

        // 5. Create the new item
        return $this->groupOrderItemRepo->create([
            'group_order_id' => $groupOrderId,
            'user_id'        => $userId,
            'item_id'        => $itemId,
            'item_name'      => $menuItem->title,
            'quantity'       => $quantity,
            'unit_price'     => $menuItem->price,
            'notes'          => $notes,
        ]);
    }
}
