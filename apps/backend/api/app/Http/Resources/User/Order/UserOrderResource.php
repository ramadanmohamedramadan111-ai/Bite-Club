<?php

namespace App\Http\Resources\User\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserOrderResource extends JsonResource
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
            'order_type' => $this->order_type,
            'status' => $this->status,
            'restaurant' => [
                'id' => $this->restaurant->id ?? null,
                'name' => $this->restaurant->name ?? null,
            ],
            'financials' => [
                'subtotal' => (float) $this->subtotal,
                'delivery_fee' => (float) $this->delivery_fee,
                'service_fee' => (float) $this->service_fee,
                'total' => (float) $this->total,
            ],
            'items' => $this->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_id' => $item->item_id,
                    'item_name' => $item->item_name,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'total_price' => (float) ($item->price * $item->quantity),
                    'notes' => $item->notes,
                ];
            }),
            'payments' => $this->payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_type' => $payment->payment_type,
                    'payment_method' => $payment->payment_method,
                    'amount' => (float) $payment->amount,
                    'status' => $payment->status,
                ];
            }),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'time_ago' => $this->created_at->diffForHumans(),
        ];
    }
}
