<?php

namespace App\Notifications\User;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class OrderPreparingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'order_preparing',
            'title' => trans('notification.order_preparing_title'),
            'body' => trans('notification.order_preparing_body', ['restaurant_name' => $this->order->restaurant->name]),
            'action_url' => config('frontend.user_url') . str_replace('{id}', $this->order->id, config('frontend.paths.user.order_tracking')),
            'order_id' => $this->order->id,
            'restaurant_name' => $this->order->restaurant->name,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => 'order_preparing',
            'title' => trans('notification.order_preparing_title'),
            'body' => trans('notification.order_preparing_body', ['restaurant_name' => $this->order->restaurant->name]),
            'action_url' => config('frontend.user_url') . str_replace('{id}', $this->order->id, config('frontend.paths.user.order_tracking')),
            'order_id' => $this->order->id,
            'restaurant_name' => $this->order->restaurant->name,
        ]);
    }

    public function broadcastType(): string
    {
        return 'order_preparing';
    }
}
