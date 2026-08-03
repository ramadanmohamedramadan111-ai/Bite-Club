<?php

namespace App\Listeners\User;

use App\Enums\Order\OrderStatusEnum;
use App\Events\OrderStatusUpdated;
use App\Notifications\User\OrderPreparingNotification;
use App\Notifications\User\OrderReadyNotification;
use App\Notifications\User\OrderOutForDeliveryNotification;
use App\Notifications\User\OrderCompletedNotification;
use App\Notifications\User\OrderCancelledNotification;

class SendOrderStatusNotification
{
    /**
     * Handle the event.
     */
    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order;

        if (!$order->user) {
            return;
        }

        match ($order->status) {
            OrderStatusEnum::PREPARING => $order->user->notify(new OrderPreparingNotification($order)),
            OrderStatusEnum::READY => $order->user->notify(new OrderReadyNotification($order)),
            OrderStatusEnum::OUT_FOR_DELIVERY => $order->user->notify(new OrderOutForDeliveryNotification($order)),
            OrderStatusEnum::COMPLETED => $order->user->notify(new OrderCompletedNotification($order)),
            OrderStatusEnum::CANCELLED => $order->user->notify(new OrderCancelledNotification($order)),
            default => null,
        };
    }
}
