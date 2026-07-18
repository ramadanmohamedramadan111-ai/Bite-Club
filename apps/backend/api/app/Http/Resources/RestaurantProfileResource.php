<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantProfileResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'description'     => $this->description,
            'phone_number'    => $this->phone_number,
            'address'         => $this->address,
            'logo_url'        => $this->logo_url ? url($this->logo_url) : config('app.url') . '/storage/restaurants/restaurant.jpeg',
            'cover_image_url' => $this->cover_image_url ? url($this->cover_image_url) : config('app.url') . '/storage/restaurants/restaurant.jpeg',
            'category_id'     => $this->category_id ? (int) $this->category_id : null,
        ];
    }
}
