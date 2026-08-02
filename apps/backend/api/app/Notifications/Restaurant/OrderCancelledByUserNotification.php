<?php

namespace App\Notifications\Restaurant;

use App\Models\Order;
use App\Traits\ApiResponseTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class OrderCancelledByUserNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable, ApiResponseTrait;

    protected Order $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $baseUrl = config('frontend.restaurant_url');
        $path = str_replace('{id}', $this->order->id, config('frontend.paths.restaurant.order_details'));

        return [
            'type' => $this->broadcastType(),
            'title' => trans('notification.order_cancelled_by_user_title'),
            'body' => trans('notification.order_cancelled_by_user_body', ['order_id' => $this->order->id]),
            'action_url' => $baseUrl . $path,
            'order_id' => $this->order->id,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    /**
     * The event name that will be broadcasted.
     */
    public function broadcastType(): string
    {
        return 'order_cancelled_by_user';
    }
}
