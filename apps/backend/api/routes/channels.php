<?php

use App\Services\Domain\User\GroupOrder\GroupOrderDomainService;
use App\Services\Domain\User\Order\OrderDomainService;
use Illuminate\Support\Facades\Broadcast;


Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('group-order.{groupId}', function ($user, $groupId) {
    $domainService = app(GroupOrderDomainService::class);

    if ($domainService->isGroupOrderMember($user->id, $groupId)) {
        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }

    return false;
});

Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $domainService = app(OrderDomainService::class);
    return $domainService->isOrderOwner($user->id, $orderId);
});
