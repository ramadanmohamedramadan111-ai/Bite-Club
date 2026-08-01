<?php

namespace App\Listeners\User;

use App\Enums\Order\OrderStatusEnum;
use App\Events\OrderStatusUpdated;
use App\Notifications\User\OrderPreparingNotification;

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
            OrderStatusEnum::PREPARING->value => $order->user->notify(new OrderPreparingNotification($order)),
            // We will add more cases here as we create the other notification classes
            // OrderStatusEnum::PREPARING->value => $order->user->notify(new OrderPreparingNotification($order)),
            // OrderStatusEnum::READY->value => $order->user->notify(new OrderReadyNotification($order)),
            // OrderStatusEnum::OUT_FOR_DELIVERY->value => $order->user->notify(new OrderOutForDeliveryNotification($order)),
            // OrderStatusEnum::COMPLETED->value => $order->user->notify(new OrderCompletedNotification($order)),
            default => null,
        };
    }
}
