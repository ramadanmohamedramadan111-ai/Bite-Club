<?php

namespace App\Repositories\Eloquent;

use App\Models\GroupOrder;
use App\Repositories\Interfaces\GroupOrderRepositoryInterface;
use App\Enums\GroupOrder\GroupOrderStatusEnum;
use Illuminate\Database\Eloquent\Collection;

class GroupOrderRepository extends BaseRepository implements GroupOrderRepositoryInterface
{
    public function __construct(GroupOrder $model)
    {
        parent::__construct($model);
    }

    public function findActiveGroupOrderForGroup(int $groupId): ?GroupOrder
    {
        return $this->query()
            ->where('group_id', $groupId)
            ->where('status', GroupOrderStatusEnum::OPEN->value)
            ->first();
    }

    public function getPaginatedHistoryForUser(int $userId, int $page, int $perPage, ?int $groupId = null)
    {
        $query = $this->query()
            ->whereIn('status', [
                GroupOrderStatusEnum::COMPLETED->value,
                GroupOrderStatusEnum::CANCELLED->value,
            ])
            ->where(function ($q) use ($userId) {
                $q->where('host_id', $userId)
                  ->orWhereHas('items', function ($itemQuery) use ($userId) {
                      $itemQuery->where('user_id', $userId);
                  })
                  ->orWhereHas('group.members', function ($memberQuery) use ($userId) {
                      $memberQuery->where('user_id', $userId);
                  });
            });

        if ($groupId) {
            $query->where('group_id', $groupId);
        }

        $query->with(['group', 'restaurant', 'host', 'items.user', 'guestItems.menuItem.menuCategory', 'order'])
            ->orderBy('created_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function getActiveSessionsForUser(int $userId): Collection
    {
        $query = $this->query()
            ->whereIn('status', [
                GroupOrderStatusEnum::OPEN->value,
                GroupOrderStatusEnum::LOCKED->value,
            ])
            ->where(function ($q) use ($userId) {
                $q->where('host_id', $userId)
                  ->orWhereHas('items', function ($itemQuery) use ($userId) {
                      $itemQuery->where('user_id', $userId);
                  })
                  ->orWhereHas('group.members', function ($memberQuery) use ($userId) {
                      $memberQuery->where('user_id', $userId);
                  });
            });

        return $query->with(['group', 'restaurant'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
