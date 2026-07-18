<?php

namespace App\Http\Resources\User\Restaurant;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\RestaurantOpeningHourResource;

class RestaurantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'logo_url'         => $this->logo_url ? url($this->logo_url) : config('app.url') . '/storage/restaurants/restaurant.jpeg',
            'cover_image_url'  => $this->cover_image_url ? url($this->cover_image_url) : config('app.url') . '/storage/restaurants/restaurant.jpeg',
            'average_rating'   => (float) $this->average_rating,
            'reviews_count'    => (int) $this->reviews_count,
            'delivery_enabled' => (bool) optional($this->setting)->delivery_enabled,
            'pickup_enabled'   => (bool) optional($this->setting)->pickup_enabled,
            'accept_orders'    => (bool) optional($this->setting)->accept_orders,
            'category_name'    => $this->category ? $this->category->name : null,
            'is_open_now'      => (bool) $this->isOpenNow(),
            'opening_hours'    => $this->when(
                $request->routeIs('*.restaurants.show') && $this->relationLoaded('openingHours'),
                fn() => RestaurantOpeningHourResource::collection($this->openingHours)
            ),
        ];
    }
}
