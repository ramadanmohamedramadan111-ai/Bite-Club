<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\UpdateRestaurantProfileRequest;
use App\DTOs\Restaurant\UpdateRestaurantProfileDto;
use App\Services\Application\RestaurantProfileApplicationService;
use App\Http\Resources\RestaurantProfileResource;

class RestaurantProfileController extends Controller
{
    public function __construct(
        private RestaurantProfileApplicationService $restaurantProfileApplicationService
    ) {}

    public function show(): JsonResponse
    {
        try {
            $restaurantId = auth('restaurant')->id();
            $restaurant = $this->restaurantProfileApplicationService->show($restaurantId);

            return $this->successResponse(
                trans('restaurant.fetch_success'),
                new RestaurantProfileResource($restaurant)
            );
        } catch (Exception $e) {
            Log::error('Failed to fetch restaurant profile: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant.fetch_failed'));
        }
    }

    public function update(UpdateRestaurantProfileRequest $request): JsonResponse
    {
        try {
            $dto = UpdateRestaurantProfileDto::fromValidatedRequest($request);
            $restaurant = $this->restaurantProfileApplicationService->update($dto);

            return $this->successResponse(
                trans('restaurant.update_success'),
                new RestaurantProfileResource($restaurant)
            );
        } catch (Exception $e) {
            Log::error('Failed to update restaurant profile: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant.update_failed'));
        }
    }
}
