<?php

namespace App\Http\Resources\User\Restaurant;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\RestaurantOpeningHourResource;

class RestaurantDetailResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'description'         => $this->description,
            'logo_url'            => $this->logo_url ? url($this->logo_url) : config('app.url') . '/storage/restaurants/restaurant.jpeg',
            'cover_image_url'     => $this->cover_image_url ? url($this->cover_image_url) : config('app.url') . '/storage/restaurants/restaurant.jpeg',
            'category'            => $this->category ? [
                'id'        => $this->category->id,
                'name'      => $this->category->name,
                'slug'      => $this->category->slug,
                'image_url' => $this->category->image_url,
            ] : null,
            'address'             => $this->address,
            'phone_number'        => $this->phone_number,
            'average_rating'      => (float) $this->average_rating,
            'reviews_count'       => (int) $this->reviews_count,
            'delivery_enabled'    => (bool) optional($this->setting)->delivery_enabled,
            'pickup_enabled'      => (bool) optional($this->setting)->pickup_enabled,
            'delivery_fee_per_km' => $this->setting ? (float) $this->setting->delivery_fee_per_km : null,
            'is_open_now'         => (bool) $this->isOpenNow(),
            'opening_hours'       => RestaurantOpeningHourResource::collection($this->openingHours),
            'latitude'            => $this->setting ? (float) $this->setting->latitude : null,
            'longitude'           => $this->setting ? (float) $this->setting->longitude : null,
        ];
    }
}
