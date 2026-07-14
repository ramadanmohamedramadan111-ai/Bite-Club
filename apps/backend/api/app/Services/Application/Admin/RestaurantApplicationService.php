<?php

namespace App\Services\Application\Admin;

use App\DTOs\Admin\Restaurant\IndexRestaurantDto;
use App\DTOs\Admin\Restaurant\UpdateRestaurantStatusDto;
use App\DTOs\Admin\Restaurant\AvailableRestaurantTransitionsDto;
use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Mail\RestaurantApprovedMail;
use App\Mail\RestaurantClosedMail;
use App\Mail\RestaurantRejectedMail;
use App\Services\Domain\Admin\RestaurantDomainService;
use Illuminate\Support\Facades\Mail;

class RestaurantApplicationService
{
    public function __construct(
        private RestaurantDomainService $restaurantDomainService
    ) {}

    public function index(IndexRestaurantDto $dto): array
    {
        $data = $this->restaurantDomainService->list($dto->toArray());

        return array_filter([
            'items' => $data['items']->map(fn ($item) => $this->mapItem($item))->toArray(),
            'meta'  => $data['meta'] ?? null,
        ]);
    }

    public function getAvailableTransitions(AvailableRestaurantTransitionsDto $dto): array
    {
        return $this->restaurantDomainService->getAvailableTransitions($dto->getId());
    }

    public function updateStatus(UpdateRestaurantStatusDto $dto): array
    {
        $result = $this->restaurantDomainService->updateStatus($dto);

        if (!$result['unchanged']) {
            $this->sendStatusMail($result['restaurant']);
        }

        return [
            'restaurant' => $this->mapItem($result['restaurant']),
            'unchanged'  => $result['unchanged'],
        ];
    }

    private function mapItem($restaurant): array
    {
        return [
            'id'                => $restaurant->id,
            'name'              => $restaurant->name,
            'email'             => $restaurant->email,
            'phone_number'      => $restaurant->phone_number,
            'category_id'       => $restaurant->category_id,
            'category'          => $restaurant->relationLoaded('category') && $restaurant->category ? [
                'id'   => $restaurant->category->id,
                'name' => $restaurant->category->name,
                'slug' => $restaurant->category->slug,
            ] : null,
            'description'       => $restaurant->description,
            'logo_url'          => $restaurant->logo_url,
            'cover_image_url'   => $restaurant->cover_image_url,
            'address'           => $restaurant->address,
            'status'            => $restaurant->status instanceof RestaurantStatusEnum
                ? $restaurant->status->value
                : $restaurant->status,
            'approved_at'       => $restaurant->approved_at,
            'approved_by'       => $restaurant->approved_by,
            'average_rating'    => $restaurant->average_rating,
            'total_orders_count' => $restaurant->total_orders_count,
        ];
    }

    private function sendStatusMail($restaurant): void
    {
        match ($restaurant->status->value ?? $restaurant->status) {
            RestaurantStatusEnum::ACTIVE->value => Mail::to($restaurant->email)->queue(new RestaurantApprovedMail([
                'restaurant_name' => $restaurant->name,
            ])),
            RestaurantStatusEnum::REJECTED->value => Mail::to($restaurant->email)->queue(new RestaurantRejectedMail([
                'restaurant_name' => $restaurant->name,
            ])),
            RestaurantStatusEnum::CLOSED->value => Mail::to($restaurant->email)->queue(new RestaurantClosedMail([
                'restaurant_name' => $restaurant->name,
            ])),
            default => null,
        };
    }
}
