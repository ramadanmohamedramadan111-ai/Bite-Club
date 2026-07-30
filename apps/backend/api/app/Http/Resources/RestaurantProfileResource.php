<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

use App\Traits\UrlFormatterTrait;

class RestaurantProfileResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'description'     => $this->description,
            'phone_number'    => $this->phone_number,
            'address'         => $this->address,
            'logo_url'        => $this->formatImageUrl($this->logo_url) ?? $this->formatImageUrl('storage/restaurants/restaurant.jpeg'),
            'cover_image_url' => $this->formatImageUrl($this->cover_image_url) ?? $this->formatImageUrl('storage/restaurants/restaurant.jpeg'),
            'category_id'     => $this->category_id ? (int) $this->category_id : null,
        ];
    }
}
