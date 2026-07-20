<?php

namespace App\Services\Application;

use App\DTOs\RestaurantSetting\ShowRestaurantSettingDto;
use App\DTOs\RestaurantSetting\UpdateRestaurantSettingDto;
use App\Services\Domain\RestaurantSetting\RestaurantSettingDomainService;
use App\Repositories\Interfaces\RestaurantSettingRepositoryInterface;

class RestaurantSettingApplicationService
{
    public function __construct(
        private RestaurantSettingDomainService $restaurantSettingDomainService,
        private RestaurantSettingRepositoryInterface $restaurantSettingRepository
    ) {}

    public function show(ShowRestaurantSettingDto $dto): array
    {
        $setting = $this->restaurantSettingDomainService->current($dto->getRestaurantId());
        return $this->mapItem($setting);
    }

    public function update(UpdateRestaurantSettingDto $dto): array
    {
        $setting = $this->restaurantSettingDomainService->updateCurrent($dto->getRestaurantId(), $dto->toArray());
        return $this->mapItem($setting);
    }

    private function mapItem($setting): array
    {
        return [
            'id'                 => $setting->id,
            'restaurant_id'      => $setting->restaurant_id,
            'is_open'             => $setting->is_open,
            'accept_orders'       => $setting->accept_orders,
            'delivery_enabled'    => $setting->delivery_enabled,
            'pickup_enabled'      => $setting->pickup_enabled,
            'latitude'            => $setting->latitude,
            'longitude'           => $setting->longitude,
            'delivery_radius'     => $setting->delivery_radius,
            'delivery_fee_per_km' => $setting->delivery_fee_per_km,
            'deposit_threshold'   => $setting->deposit_threshold,
            'deposit_percentage'  => $setting->deposit_percentage,
            'min_price_order'     => $setting->min_price_order,
            'updated_at'          => $setting->updated_at ? $setting->updated_at->toIso8601String() : null,
        ];
    }
}
