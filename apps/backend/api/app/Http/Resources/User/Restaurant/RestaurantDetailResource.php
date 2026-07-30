<?php

namespace App\Http\Resources\User\Restaurant;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\RestaurantOpeningHourResource;
use App\Traits\UrlFormatterTrait;

class RestaurantDetailResource extends JsonResource
{
    use UrlFormatterTrait;

    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'description'         => $this->description,
            'logo_url'            => $this->formatImageUrl($this->logo_url) ?? $this->formatImageUrl('storage/restaurants/restaurant.jpeg'),
            'cover_image_url'     => $this->formatImageUrl($this->cover_image_url) ?? $this->formatImageUrl('storage/restaurants/restaurant.jpeg'),
            'category'            => $this->category ? [
                'id'        => $this->category->id,
                'name'      => $this->category->name,
                'slug'      => $this->category->slug,
                'image_url' => $this->formatImageUrl($this->category->image_url),
            ] : null,
            'category_name'       => $this->category ? $this->category->name : null,
            'address'             => $this->address,
            'phone_number'        => $this->phone_number,
            'average_rating'      => (float) $this->average_rating,
            'reviews_count'       => (int) $this->reviews_count,
            'delivery_enabled'    => (bool) optional($this->setting)->delivery_enabled,
            'pickup_enabled'      => (bool) optional($this->setting)->pickup_enabled,
            'accept_orders'        => (bool) optional($this->setting)->accept_orders,
            'delivery_fee_per_km' => $this->setting ? (float) $this->setting->delivery_fee_per_km : null,
            'is_open_now'         => (bool) $this->isOpenNow(),
            'opening_hours'       => RestaurantOpeningHourResource::collection($this->openingHours),
            'latitude'            => $this->setting ? (float) $this->setting->latitude : null,
            'longitude'           => $this->setting ? (float) $this->setting->longitude : null,
            'min_price_order'     => $this->setting ? (float) $this->setting->min_price_order : null,
        ];
    }
}
