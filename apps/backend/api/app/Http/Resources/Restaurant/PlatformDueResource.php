<?php

namespace App\Http\Resources\Restaurant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlatformDueResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'commission_rate' => $this->commission_rate,
            'commission_amount' => $this->commission_amount,
            'service_fee' => $this->service_fee,
            'total_due' => $this->total_due,
            'invoice_status' => $this->invoice_status,
            'created_at' => $this->created_at->toDateTimeString(),
            'order' => [
                'total_price' => $this->whenLoaded('order', fn() => $this->order->total),
                'status' => $this->whenLoaded('order', fn() => $this->order->status),
                'created_at' => $this->whenLoaded('order', fn() => $this->order->created_at->toDateTimeString()),
            ],
        ];
    }
}
