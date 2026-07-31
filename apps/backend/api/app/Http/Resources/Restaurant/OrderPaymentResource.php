<?php

namespace App\Http\Resources\Restaurant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'transaction_id' => $this->transaction_id,
            'payment_type' => $this->payment_type,
            'payment_method' => $this->payment_method,
            'amount' => $this->amount,
            'status' => $this->status,
            'created_at' => $this->created_at->toDateTimeString(),
            'user' => $this->whenLoaded('order', function () {
                return $this->order->relationLoaded('user') ? [
                    'id' => $this->order->user->id,
                    'name' => $this->order->user->first_name . ' ' . $this->order->user->last_name,
                    'email' => $this->order->user->email,
                ] : null;
            }),
        ];
    }
}
