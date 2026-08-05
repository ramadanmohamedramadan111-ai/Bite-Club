<?php

use App\Services\Domain\User\GroupOrder\GroupOrderDomainService;
use App\Services\Domain\User\Order\OrderDomainService;
use Illuminate\Support\Facades\Broadcast;


Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('App.Models.Restaurant.{id}', function ($restaurant, $id) {
    return (int) $restaurant->id === (int) $id;
}, ['guards' => ['restaurant']]);

Broadcast::channel('group-order.{groupId}', function ($user = null, $groupId) {
    $domainService = app(GroupOrderDomainService::class);
    $groupOrder = \App\Models\GroupOrder::find($groupId);

    if (!$groupOrder) {
        return false;
    }

    if ($user && ($domainService->isGroupOrderMember($user->id, $groupId) || $groupOrder->allow_guests)) {
        return [
            'id' => $user->id,
            'name' => $user->full_name ?? $user->name,
        ];
    }

    if ($groupOrder->allow_guests) {
        $guestId = request()->header('X-Guest-ID') ?? request()->input('guest_id') ?? 'guest_' . uniqid();
        $guestName = request()->header('X-Guest-Name') ?? request()->input('guest_name') ?? 'Guest';
        return [
            'id' => $guestId,
            'name' => $guestName,
            'is_guest' => true,
        ];
    }

    return false;
});

Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $domainService = app(OrderDomainService::class);
    return $domainService->isOrderOwner($user->id, $orderId);
});
