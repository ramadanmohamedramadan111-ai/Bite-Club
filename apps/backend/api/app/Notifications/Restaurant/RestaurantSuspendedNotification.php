<?php

namespace App\Notifications\Restaurant;

use App\Models\Restaurant;
use App\Traits\ApiResponseTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class RestaurantSuspendedNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable, ApiResponseTrait;

    protected Restaurant $restaurant;

    /**
     * Create a new notification instance.
     */
    public function __construct(Restaurant $restaurant)
    {
        $this->restaurant = $restaurant;
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
        return [
            'type' => $this->broadcastType(),
            'title' => trans('notification.restaurant_suspended_title'),
            'body' => trans('notification.restaurant_suspended_body'),
            'action_url' => config('frontend.restaurant_url') . '/invoices',
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
        return 'restaurant_suspended';
    }
}
