<?php

namespace App\Http\Resources\Admin\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'status'       => $this->status->value,
            'order_type'   => $this->order_type->value,
            'subtotal'     => (float) $this->subtotal,
            'delivery_fee' => (float) $this->delivery_fee,
            'service_fee'  => (float) $this->service_fee,
            'total'        => (float) $this->total,
            'created_at'   => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
            'updated_at'   => $this->updated_at ? $this->updated_at->format('Y-m-d H:i:s') : null,
            'user'         => $this->relationLoaded('user') && $this->user ? [
                'id'                  => $this->user->id,
                'username'            => $this->user->username,
                'first_name'          => $this->user->first_name,
                'last_name'           => $this->user->last_name,
                'email'               => $this->user->email,
                'phone_number'        => $this->user->phone_number,
                'failed_pickup_count' => $this->user->failed_pickup_count,
                'status'              => $this->user->status->value,
                'last_login_at'       => $this->user->last_login_at ? $this->user->last_login_at->format('Y-m-d H:i:s') : null,
                'created_at'          => $this->user->created_at ? $this->user->created_at->format('Y-m-d H:i:s') : null,
            ] : null,
            'restaurant'   => $this->relationLoaded('restaurant') && $this->restaurant ? [
                'id'           => $this->restaurant->id,
                'name'         => $this->restaurant->name,
                'email'        => $this->restaurant->email,
                'phone_number' => $this->restaurant->phone_number,
                'address'      => $this->restaurant->address,
                'description'  => $this->restaurant->description,
                'status'       => $this->restaurant->status->value,
                'average_rating' => (float) $this->restaurant->average_rating,
            ] : null,
            'items'        => $this->relationLoaded('items') && $this->items ? $this->items->map(function ($item) {
                return [
                    'id'          => $item->id,
                    'item_id'     => $item->item_id,
                    'item_name'   => $item->item_name,
                    'quantity'    => $item->quantity,
                    'price'       => (float) $item->price,
                    'total_price' => (float) ($item->price * $item->quantity),
                    'notes'       => $item->notes,
                ];
            }) : [],
            'payments'     => $this->relationLoaded('payments') && $this->payments ? $this->payments->map(function ($payment) {
                return [
                    'id'             => $payment->id,
                    'payment_type'   => $payment->payment_type?->value,
                    'payment_method' => $payment->payment_method?->value,
                    'amount'         => (float) $payment->amount,
                    'status'         => $payment->status->value,
                    'transaction_id' => $payment->transaction_id,
                    'created_at'     => $payment->created_at ? $payment->created_at->format('Y-m-d H:i:s') : null,
                ];
            }) : [],
        ];
    }
}
