<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderCancelledByTimeoutNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
        private readonly int $pointsRefunded = 0
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject(trans('order.cancelled_by_timeout_title'))
            ->greeting(trans('order.greeting', ['name' => $notifiable->first_name ?? 'there']))
            ->line(trans('order.cancelled_by_timeout_message', ['order_id' => $this->order->id]));

        if ($this->pointsRefunded > 0) {
            $message->line(trans('order.points_refunded_line', ['points' => $this->pointsRefunded]));
        }

        return $message->line(trans('order.thank_you'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'order_cancelled_timeout',
            'title' => trans('order.cancelled_by_timeout_title'),
            'body' => trans('order.cancelled_by_timeout_message_db'),
            'action_url' => config('frontend.user_url') . str_replace('{id}', $this->order->id, config('frontend.paths.user.order_tracking')),
            'order_id' => $this->order->id,
            'restaurant_name' => $this->order->restaurant->name,
            'points_refunded' => $this->pointsRefunded,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => 'order_cancelled_timeout',
            'title' => trans('order.cancelled_by_timeout_title'),
            'body' => trans('order.cancelled_by_timeout_message_db'),
            'action_url' => config('frontend.user_url') . str_replace('{id}', $this->order->id, config('frontend.paths.user.order_tracking')),
            'order_id' => $this->order->id,
            'restaurant_name' => $this->order->restaurant->name,
            'points_refunded' => $this->pointsRefunded,
        ]);
    }

    public function broadcastType(): string
    {
        return 'order_cancelled_timeout';
    }
}
