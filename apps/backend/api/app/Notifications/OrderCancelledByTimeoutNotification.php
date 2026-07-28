<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Order;

class OrderCancelledByTimeoutNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
        private readonly int $pointsRefunded = 0
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
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
            'order_id' => $this->order->id,
            'restaurant_id' => $this->order->restaurant_id,
            'title' => trans('order.cancelled_by_timeout_title'),
            'message' => trans('order.cancelled_by_timeout_message_db'),
            'points_refunded' => $this->pointsRefunded,
            'type' => 'order_cancelled_timeout',
        ];
    }
}
