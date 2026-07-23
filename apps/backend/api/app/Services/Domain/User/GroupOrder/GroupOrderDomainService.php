<?php

namespace App\Services\Domain\User\GroupOrder;

use App\Models\GroupOrder;
use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Repositories\Interfaces\GroupOrderItemRepositoryInterface;
use App\Repositories\Interfaces\CartRepositoryInterface;
use App\Repositories\Interfaces\CartItemRepositoryInterface;
use App\Repositories\Interfaces\User\GroupMemberRepositoryInterface;
use App\Services\Domain\User\Order\OrderDomainService;
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
}
