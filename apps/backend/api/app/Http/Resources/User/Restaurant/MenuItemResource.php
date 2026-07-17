<?php

namespace App\Http\Resources\User\Restaurant;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

class MenuItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'description'  => $this->description,
            'price'        => (float) $this->price,
            'is_available' => $this->availability === MenuItemAvailabilityEnum::AVAILABLE,
            'image_url'    => $this->image_url ? url($this->image_url) : null,
        ];
    }
}
