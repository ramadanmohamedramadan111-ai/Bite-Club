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
use App\Services\Application\User\Order\OrderApplicationService;
use App\DTOs\User\Order\CheckoutPreviewDto;
use App\DTOs\User\Order\PlaceOrderDto;

class GroupOrderDomainService
{
    public function __construct(
        private readonly GroupOrderRepositoryInterface $groupOrderRepo,
        private readonly GroupOrderItemRepositoryInterface $groupOrderItemRepo,
        private readonly CartRepositoryInterface $cartRepo,
        private readonly CartItemRepositoryInterface $cartItemRepo,
        private readonly GroupMemberRepositoryInterface $groupMemberRepo,
        private readonly MenuItemRepositoryInterface $menuItemRepo,
        private readonly OrderApplicationService $orderApplicationService
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

    public function removeItem(int $userId, int $groupOrderId, int $groupOrderItemId): void
    {
        $groupOrder = $this->groupOrderRepo->findOrFail($groupOrderId);

        // 1. Check if the order is still OPEN
        if ($groupOrder->status !== GroupOrderStatusEnum::OPEN) {
            throw new Exception(trans('group_order.order_not_open'));
        }

        $item = $this->groupOrderItemRepo->findOrFail($groupOrderItemId);

        // 2. Check if item belongs to this group order
        if ($item->group_order_id !== $groupOrderId) {
            throw new Exception(trans('group_order.item_not_in_order'));
        }

        // 3. Only the host or the user who added the item can remove it
        if ($item->user_id !== $userId && $groupOrder->host_id !== $userId) {
            throw new Exception(trans('group_order.cannot_remove_item'));
        }

        $this->groupOrderItemRepo->delete($groupOrderItemId);
    }

    public function updateItemQuantity(int $userId, int $groupOrderId, int $groupOrderItemId, int $quantity): void
    {
        $groupOrder = $this->groupOrderRepo->findOrFail($groupOrderId);

        // 1. Check if the order is still OPEN
        if ($groupOrder->status !== GroupOrderStatusEnum::OPEN) {
            throw new Exception(trans('group_order.order_not_open'));
        }

        $item = $this->groupOrderItemRepo->findOrFail($groupOrderItemId);

        // 2. Check if item belongs to this group order
        if ($item->group_order_id !== $groupOrderId) {
            throw new Exception(trans('group_order.item_not_in_order'));
        }

        // 3. Only the host or the user who added the item can update its quantity
        if ($item->user_id !== $userId && $groupOrder->host_id !== $userId) {
            throw new Exception(trans('group_order.cannot_update_item'));
        }

        $this->groupOrderItemRepo->update($groupOrderItemId, ['quantity' => $quantity]);
    }

    public function getGroupOrder(int $userId, int $groupOrderId): GroupOrder
    {
        $groupOrder = $this->groupOrderRepo->findOrFail($groupOrderId);

        // Check if the user is a member of the group
        $isMember = $this->groupMemberRepo->query()
            ->where('group_id', $groupOrder->group_id)
            ->where('user_id', $userId)
            ->exists();

        if (!$isMember) {
            throw new Exception(trans('group_order.not_member'));
        }

        $groupOrder->load([
            'restaurant', 
            'host', 
            'items.user', 
            'items.menuItem.menuCategory'
        ]);

        return $groupOrder;
    }

    public function previewCheckout(int $userId, int $groupOrderId, string $orderType, ?float $lat, ?float $long): array
    {
        DB::transaction(function () use ($userId, $groupOrderId) {
            $groupOrder = $this->groupOrderRepo->findOrFail($groupOrderId);

            // 1. Only host can checkout
            if ($groupOrder->host_id !== $userId) {
                throw new Exception(trans('group_order.only_host_can_checkout'));
            }

            // 2. Lock the order if it's still open
            if ($groupOrder->status === GroupOrderStatusEnum::OPEN) {
                $this->groupOrderRepo->update($groupOrderId, ['status' => GroupOrderStatusEnum::LOCKED->value]);
            }

            // 3. Clear host cart & move aggregated items
            $this->aggregateAndMoveToPersonalCart($groupOrder, $userId);
        });

        // 4. Call the existing preview system using the OrderApplicationService
        $checkoutPreviewDto = new CheckoutPreviewDto($userId, $orderType, $lat, $long, true);
        return $this->orderApplicationService->previewCheckout($checkoutPreviewDto);
    }

    private function aggregateAndMoveToPersonalCart(GroupOrder $groupOrder, int $hostId): void
    {
        // Fetch group order items
        $items = $this->groupOrderItemRepo->query()
            ->where('group_order_id', $groupOrder->id)
            ->get();

        if ($items->isEmpty()) {
            throw new Exception(trans('group_order.empty_order'));
        }

        // Aggregate items (group by item_id AND notes)
        $aggregatedItems = [];
        foreach ($items as $item) {
            $key = $item->item_id . '_' . md5((string)$item->notes);
            if (!isset($aggregatedItems[$key])) {
                $aggregatedItems[$key] = [
                    'item_id' => $item->item_id,
                    'item_name' => $item->item_name,
                    'unit_price' => $item->unit_price,
                    'notes' => $item->notes,
                    'quantity' => 0,
                ];
            }
            $aggregatedItems[$key]['quantity'] += $item->quantity;
        }

        // Find or create host cart
        $cart = $this->cartRepo->findOrCreateForGroupOrder(
            $hostId,
            $groupOrder->restaurant_id,
            $groupOrder->id
        );

        // Clear existing cart items
        $this->cartItemRepo->query()->where('cart_id', $cart->id)->delete();

        // Update cart to point to the current restaurant and group order
        $this->cartRepo->update($cart->id, [
            'restaurant_id' => $groupOrder->restaurant_id,
            'group_order_id' => $groupOrder->id
        ]);

        // Insert new aggregated items
        foreach ($aggregatedItems as $aggItem) {
            $this->cartItemRepo->create([
                'cart_id' => $cart->id,
                'item_id' => $aggItem['item_id'],
                'item_name' => $aggItem['item_name'],
                'quantity' => $aggItem['quantity'],
                'unit_price' => $aggItem['unit_price'],
                'notes' => $aggItem['notes'],
            ]);
        }
    }

    public function unlock(int $userId, int $groupOrderId): void
    {
        $groupOrder = $this->groupOrderRepo->findOrFail($groupOrderId);

        // 1. Only host can unlock
        if ($groupOrder->host_id !== $userId) {
            throw new Exception(trans('group_order.only_host_can_unlock'));
        }

        // 2. Ensure order is locked before unlocking
        if ($groupOrder->status !== GroupOrderStatusEnum::LOCKED) {
            throw new Exception(trans('group_order.order_not_locked'));
        }

        // 3. Change status back to OPEN
        $this->groupOrderRepo->update($groupOrderId, ['status' => GroupOrderStatusEnum::OPEN->value]);
    }

    public function placeOrder(int $userId, int $groupOrderId, string $orderType, string $paymentOptionId, ?float $lat, ?float $long): array
    {
        $groupOrder = $this->groupOrderRepo->findOrFail($groupOrderId);

        // 1. Only host can checkout
        if ($groupOrder->host_id !== $userId) {
            throw new Exception(trans('group_order.only_host_can_checkout'));
        }

        // 2. Ensure order is locked
        if ($groupOrder->status !== GroupOrderStatusEnum::LOCKED) {
            throw new Exception(trans('group_order.must_be_locked_to_place'));
        }

        // 3. Sync personal cart with group order items again just to be safe
        $this->aggregateAndMoveToPersonalCart($groupOrder, $userId);

        // 4. Place order using the old system
        $placeOrderDto = new PlaceOrderDto($userId, $orderType, $paymentOptionId, $lat, $long, true);
        $result = $this->orderApplicationService->placeOrder($placeOrderDto);

        // 5. Mark group order as COMPLETED and link the created order_id
        $this->groupOrderRepo->update($groupOrderId, [
            'status' => GroupOrderStatusEnum::COMPLETED->value,
            'order_id' => $result['order_id'] ?? null,
        ]);

        return $result;
    }
}
