<?php

namespace App\Observers;

use App\Models\Restaurant;
use App\Repositories\Interfaces\RestaurantSettingRepositoryInterface;
use App\Repositories\Interfaces\RestaurantOpeningHourRepositoryInterface;

class RestaurantObserver
{
    public function __construct(
        private RestaurantSettingRepositoryInterface $restaurantSettingRepository,
        private RestaurantOpeningHourRepositoryInterface $restaurantOpeningHourRepository
    ) {}

    /**
     * Handle the Restaurant "created" event.
     */
    public function created(Restaurant $restaurant): void
    {
        $this->restaurantSettingRepository->create([
            'restaurant_id'       => $restaurant->id,
            'is_open'             => true,
            'accept_orders'       => true,
            'delivery_enabled'    => true,
            'pickup_enabled'      => true,
            'latitude'            => 0.00000000,
            'longitude'           => 0.00000000,
            'delivery_radius'     => 10.00,
            'delivery_fee_per_km' => 5.00,
            'deposit_threshold'   => 250.00,
            'deposit_percentage'  => 50.00,
            'min_price_order'     => 25.00,
        ]);

        for ($day = 0; $day <= 6; $day++) {
            $this->restaurantOpeningHourRepository->create([
                'restaurant_id' => $restaurant->id,
                'day_of_week'   => $day,
                'opens_at'      => '10:00',
                'closes_at'     => '22:00',
                'is_closed'     => false,
            ]);
        }
    }
}
