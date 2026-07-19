<?php

namespace App\Http\Resources\User\Cart;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'item_id'     => $this->item_id,
            'item_name'   => $this->item_name,
            'quantity'    => $this->quantity,
            'unit_price'  => (float) $this->unit_price,
            'total_price' => (float) ($this->quantity * $this->unit_price),
            'notes'       => $this->notes,
        ];
    }
}
