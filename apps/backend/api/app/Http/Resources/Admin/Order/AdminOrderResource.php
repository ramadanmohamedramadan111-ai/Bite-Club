<?php

namespace App\Http\Resources\Admin\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderResource extends JsonResource
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
            'user'         => $this->relationLoaded('user') && $this->user ? [
                'id'         => $this->user->id,
                'first_name' => $this->user->first_name,
                'last_name'  => $this->user->last_name,
                'email'      => $this->user->email,
            ] : null,
            'restaurant'   => $this->relationLoaded('restaurant') && $this->restaurant ? [
                'id'   => $this->restaurant->id,
                'name' => $this->restaurant->name,
            ] : null,
        ];
    }
}
