<?php

namespace App\Notifications\User;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class OrderOutForDeliveryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'order_out_for_delivery',
            'title' => trans('notification.order_out_for_delivery_title'),
            'body' => trans('notification.order_out_for_delivery_body', ['restaurant_name' => $this->order->restaurant->name]),
            'action_url' => config('frontend.user_url') . str_replace('{id}', $this->order->id, config('frontend.paths.user.order_tracking')),
            'order_id' => $this->order->id,
            'restaurant_name' => $this->order->restaurant->name,
        ];
    }
}
