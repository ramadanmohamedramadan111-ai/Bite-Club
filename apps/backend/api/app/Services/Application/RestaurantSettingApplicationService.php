<?php

namespace App\Services\Application;

use App\DTOs\RestaurantSetting\IndexRestaurantSettingDto;
use App\DTOs\RestaurantSetting\ShowRestaurantSettingDto;
use App\DTOs\RestaurantSetting\UpdateRestaurantSettingDto;
use App\DTOs\RestaurantSetting\StoreRestaurantSettingDto;
use App\Services\Domain\RestaurantSetting\RestaurantSettingDomainService;
use App\Repositories\Interfaces\RestaurantSettingRepositoryInterface;

class RestaurantSettingApplicationService
{
    public function __construct(
        private RestaurantSettingDomainService $restaurantSettingDomainService,
        private RestaurantSettingRepositoryInterface $restaurantSettingRepository
    ) {}

    public function index(IndexRestaurantSettingDto $dto): array
    {
        $data = $this->restaurantSettingDomainService->list($dto->toArray());

        return array_filter([
            'items' => $data['items']->map(fn($item) => $this->mapItem($item))->toArray(),
            'meta'  => $data['meta'] ?? null,
        ]);
    }

    public function show(ShowRestaurantSettingDto $dto): array
    {
        $setting = $this->restaurantSettingDomainService->findOrFail($dto->getId());
        return $this->mapItem($setting);
    }

    public function store(StoreRestaurantSettingDto $dto): array
    {
        $setting = $this->restaurantSettingDomainService->create($dto->toArray());
        return $this->mapItem($setting);
    }

    public function update(UpdateRestaurantSettingDto $dto): array
    {
        $setting = $this->restaurantSettingDomainService->update($dto->getId(), $dto->toArray());
        return $this->mapItem($setting);
    }

    private function mapItem($setting): array
    {
        return [
            'id'                 => $setting->id,
            'restaurant_id'      => $setting->restaurant_id,
            'deposit_threshold'  => $setting->deposit_threshold,
            'deposit_percentage' => $setting->deposit_percentage,
            'updated_at'         => $setting->updated_at ? $setting->updated_at->toIso8601String() : null,
        ];
    }
}
