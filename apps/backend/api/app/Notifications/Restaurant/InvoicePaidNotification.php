<?php

namespace App\Notifications\Restaurant;

use App\Models\Invoice;
use App\Traits\ApiResponseTrait;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class InvoicePaidNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable, ApiResponseTrait;

    protected Invoice $invoice;

    /**
     * Create a new notification instance.
     */
    public function __construct(Invoice $invoice)
    {
        $this->invoice = $invoice;
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
        $path = str_replace('{id}', $this->invoice->id, config('frontend.paths.restaurant.invoice_details'));

        return [
            'type' => $this->broadcastType(),
            'title' => trans('notification.invoice_paid_title'),
            'body' => trans('notification.invoice_paid_body', [
                'invoice_id' => $this->invoice->id,
                'amount' => $this->invoice->amount,
            ]),
            'action_url' => $baseUrl . $path,
            'invoice_id' => $this->invoice->id,
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
        return 'invoice_paid';
    }
}
