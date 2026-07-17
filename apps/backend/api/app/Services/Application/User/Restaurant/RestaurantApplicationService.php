<?php

namespace App\Services\Application\User\Restaurant;

use App\DTOs\User\Restaurant\ListRestaurantsDto;
use App\DTOs\User\Restaurant\NearestRestaurantsDto;
use App\Services\Domain\User\Restaurant\RestaurantDomainService;
use App\Http\Resources\User\Restaurant\RestaurantResource;

class RestaurantApplicationService
{
    public function __construct(
        private RestaurantDomainService $restaurantDomainService
    ) {}

    public function listRestaurants(ListRestaurantsDto $dto): array
    {
        $result = $this->restaurantDomainService->listForUser($dto->getFilters());

        return [
            'items' => RestaurantResource::collection($result['items']),
            'meta'  => $result['meta'],
        ];
    }

    public function getNearest(NearestRestaurantsDto $dto): array
    {
        if ($dto->getLatitude() !== null && $dto->getLongitude() !== null) {
            $restaurants = $this->restaurantDomainService->getNearest(
                $dto->getLatitude(),
                $dto->getLongitude(),
                $dto->getLimit()
            );
        } else {
            $restaurants = $this->restaurantDomainService->getHighestRated($dto->getLimit());
        }

        return $restaurants->map(function ($restaurant) {
            return [
                'id'              => $restaurant->id,
                'name'            => $restaurant->name,
                'description'     => $restaurant->description,
                'logo_url'        => $restaurant->logo_url ? url($restaurant->logo_url) : config('app.url') . '/storage/restaurants/restaurant.jpeg',
                'cover_image_url' => $restaurant->cover_image_url ? url($restaurant->cover_image_url) : config('app.url') . '/storage/restaurants/restaurant.jpeg',
                'distance'        => isset($restaurant->distance) ? round($restaurant->distance, 2) : null,
                'average_rating'  => $restaurant->average_rating,
                'reviews_count'   => $restaurant->reviews_count,
                'settings'        => [
                    'is_open'          => $restaurant->setting->is_open,
                    'accept_orders'    => $restaurant->setting->accept_orders,
                    'delivery_enabled' => $restaurant->setting->delivery_enabled,
                    'pickup_enabled'   => $restaurant->setting->pickup_enabled,
                    'latitude'         => $restaurant->setting->latitude,
                    'longitude'        => $restaurant->setting->longitude,
                ]
            ];
        })->toArray();
    }
}
