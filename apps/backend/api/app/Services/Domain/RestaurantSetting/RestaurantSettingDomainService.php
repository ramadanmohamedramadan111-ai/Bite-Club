<?php

namespace App\Services\Domain\RestaurantSetting;

use Exception;
use App\Models\RestaurantSetting;
use Illuminate\Support\Facades\Auth;
use App\Repositories\Interfaces\RestaurantSettingRepositoryInterface;

class RestaurantSettingDomainService
{
    public function __construct(
        private RestaurantSettingRepositoryInterface $restaurantSettingRepository
    ) {}



    public function current(int $restaurantId): RestaurantSetting
    {
        return $this->restaurantSettingRepository->firstOrFail(['restaurant_id' => $restaurantId]);
    }

    public function updateCurrent(int $restaurantId, array $data): RestaurantSetting
    {
        $current = $this->current($restaurantId);

        if (isset($data['restaurant_id'])) {
            unset($data['restaurant_id']);
        }

        $this->restaurantSettingRepository->update($current->id, $data);
        return $this->current($restaurantId);
    }


}
