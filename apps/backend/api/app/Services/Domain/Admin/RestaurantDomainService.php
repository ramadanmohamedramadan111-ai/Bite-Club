<?php

namespace App\Services\Domain\Admin;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Models\Restaurant;
use App\Repositories\Interfaces\RestaurantRepositoryInterface;
use App\Services\Domain\Restaurant\Support\RestaurantStatusTransition;
use Illuminate\Support\Facades\Auth;

class RestaurantDomainService
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository
    ) {}

    public function list(array $filters): array
    {
        return $this->restaurantRepository->listForAdmin($filters);
    }

    public function getAvailableTransitions(int $id): array
    {
        $restaurant = $this->restaurantRepository->findOrFail($id);
        
        return RestaurantStatusTransition::getAvailableTransitions($restaurant->status);
    }

    public function updateStatus(int $id, RestaurantStatusEnum $status): array
    {
        $restaurant = $this->restaurantRepository->findOrFail($id);

        if ($restaurant->status === $status) {
            return [
                'restaurant' => $restaurant->load('category'),
                'unchanged'  => true,
            ];
        }

        RestaurantStatusTransition::assert(
            $restaurant->status,
            $status
        );

        $attributes = [
            'status' => $status->value,
        ];

        if ($status->isActive() && $restaurant->status->isPendingApproval()) {
            $attributes['approved_at'] = now();
            $attributes['approved_by'] = Auth::guard('admin')->id();
        }

        $this->restaurantRepository->update($restaurant->id, $attributes);

        return [
            'restaurant' => $this->restaurantRepository->findOrFail($restaurant->id)->load('category'),
            'unchanged'  => false,
        ];
    }
}
