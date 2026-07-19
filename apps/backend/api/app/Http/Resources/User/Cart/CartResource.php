<?php

namespace App\Http\Resources\User\Cart;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = CartItemResource::collection($this->whenLoaded('items'));
        
        $subtotal = 0;
        if ($this->relationLoaded('items')) {
            $subtotal = $this->items->sum(function ($item) {
                return $item->quantity * $item->unit_price;
            });
        }

        return [
            'id' => $this->id,
            'restaurant' => [
                'id' => $this->restaurant->id ?? null,
                'name' => $this->restaurant->name ?? null,
            ],
            'subtotal' => (float) $subtotal,
            'items' => $items,
        ];
    }
}
