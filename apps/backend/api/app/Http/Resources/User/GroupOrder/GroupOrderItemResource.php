<?php

namespace App\Http\Resources\User\GroupOrder;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Traits\UrlFormatterTrait;

class GroupOrderItemResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item' => [
                'id' => $this->menuItem->id,
                'title' => $this->menuItem->title,
                'image_url' => $this->formatImageUrl($this->menuItem->image_url),
                'price' => (float) $this->menuItem->price,
            ],
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'notes' => $this->notes,
            'total_price' => (float) ($this->quantity * $this->unit_price),
        ];
    }
}
