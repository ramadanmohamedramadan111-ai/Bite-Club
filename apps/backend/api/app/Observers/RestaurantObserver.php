<?php

namespace App\Observers;

use App\Models\Restaurant;

class RestaurantObserver
{
    /**
     * Handle the Restaurant "created" event.
     */
    public function created(Restaurant $restaurant): void
    {
        $restaurant->setting()->create([
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
        ]);
    }
}
