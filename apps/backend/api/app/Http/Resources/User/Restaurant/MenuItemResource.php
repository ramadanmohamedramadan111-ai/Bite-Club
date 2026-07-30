<?php

namespace App\Http\Resources\User\Restaurant;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;
use App\Traits\UrlFormatterTrait;

class MenuItemResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'description'  => $this->description,
            'price'        => (float) $this->price,
            'is_available' => $this->availability === MenuItemAvailabilityEnum::AVAILABLE,
            'image_url'    => $this->formatImageUrl($this->image_url),
        ];
    }
}
