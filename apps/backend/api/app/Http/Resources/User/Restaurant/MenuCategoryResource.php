<?php

namespace App\Http\Resources\User\Restaurant;

use Illuminate\Http\Resources\Json\JsonResource;

class MenuCategoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'items_count' => (int) $this->active_items_count,
            'items'       => MenuItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
