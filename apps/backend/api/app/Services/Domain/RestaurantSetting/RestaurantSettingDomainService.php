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

    public function list(array $filters): array
    {
        $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 15;

        if (isset($filters['all']) && filter_var($filters['all'], FILTER_VALIDATE_BOOLEAN) === true) {
            $settings = $this->restaurantSettingRepository->get(orderBy: ['id' => 'desc']);
            return [
                'items' => $settings
            ];
        }

        $paginator = $this->restaurantSettingRepository->paginate(
            perPage: $perPage,
            orderBy: ['id' => 'desc']
        );

        return [
            'items' => collect($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ];
    }

    public function findOrFail(int $id): RestaurantSetting
    {
        $setting = $this->restaurantSettingRepository->findOrFail($id);
        
        $this->authorize($setting);

        return $setting;
    }

    public function update(int $id, array $data): RestaurantSetting
    {
        $setting = $this->restaurantSettingRepository->findOrFail($id);
        
        $this->authorize($setting);

        if (isset($data['restaurant_id'])) {
            unset($data['restaurant_id']);
        }

        $this->restaurantSettingRepository->update($id, $data);
        return $this->findOrFail($id);
    }

    public function create(array $data): RestaurantSetting
    {
        return $this->restaurantSettingRepository->create($data);
    }

    private function authorize(RestaurantSetting $setting): void
    {
        $restaurant = Auth::guard('restaurant')->user();
        if ($restaurant && $setting->restaurant_id !== $restaurant->id) {
            throw new Exception("Unauthorized to access these restaurant settings.");
        }
    }
}
