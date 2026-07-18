<?php

namespace App\Services\Application;

use App\DTOs\Restaurant\UpdateRestaurantProfileDto;
use App\Services\Domain\Restaurant\RestaurantProfileDomainService;
use App\Traits\FileUploadTrait;
use App\Models\Restaurant;

class RestaurantProfileApplicationService
{
    use FileUploadTrait;

    public function __construct(
        private RestaurantProfileDomainService $restaurantProfileDomainService
    ) {}

    public function show(int $restaurantId): Restaurant
    {
        return $this->restaurantProfileDomainService->getProfile($restaurantId);
    }

    public function update(UpdateRestaurantProfileDto $dto): Restaurant
    {
        $restaurantId = $dto->getRestaurantId();
        $restaurant = $this->restaurantProfileDomainService->getProfile($restaurantId);

        $data = $dto->toArray();

        // Handle logo upload
        if ($dto->getLogo()) {
            if (!empty($restaurant->logo_url)) {
                $this->deleteFile($restaurant->logo_url);
            }
            $data['logo_url'] = $this->uploadFile($dto->getLogo(), 'restaurants');
        }

        // Handle cover image upload
        if ($dto->getCoverImage()) {
            if (!empty($restaurant->cover_image_url)) {
                $this->deleteFile($restaurant->cover_image_url);
            }
            $data['cover_image_url'] = $this->uploadFile($dto->getCoverImage(), 'restaurants');
        }

        return $this->restaurantProfileDomainService->updateProfile($restaurantId, $data);
    }
}
