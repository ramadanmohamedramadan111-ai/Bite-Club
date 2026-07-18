<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\RestaurantOpeningHour\UpdateRestaurantOpeningHoursRequest;
use App\DTOs\RestaurantOpeningHour\UpdateRestaurantOpeningHoursDto;
use App\Services\Application\RestaurantOpeningHourApplicationService;
use App\Http\Resources\RestaurantOpeningHourResource;

class RestaurantOpeningHourController extends Controller
{
    public function __construct(
        private RestaurantOpeningHourApplicationService $restaurantOpeningHourApplicationService
    ) {}

    public function show(): JsonResponse
    {
        try {
            $restaurantId = auth('restaurant')->id();
            $result = $this->restaurantOpeningHourApplicationService->show($restaurantId);

            return $this->successResponse(
                trans('restaurant_opening_hour.fetch_success'),
                RestaurantOpeningHourResource::collection($result)
            );
        } catch (Exception $e) {
            Log::error('Failed to fetch restaurant opening hours: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant_opening_hour.fetch_failed'));
        }
    }

    public function update(UpdateRestaurantOpeningHoursRequest $request): JsonResponse
    {
        try {
            $dto = UpdateRestaurantOpeningHoursDto::fromValidatedRequest($request);
            $result = $this->restaurantOpeningHourApplicationService->update($dto);

            return $this->successResponse(
                trans('restaurant_opening_hour.update_success'),
                RestaurantOpeningHourResource::collection($result)
            );
        } catch (Exception $e) {
            Log::error('Failed to update restaurant opening hours: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant_opening_hour.update_failed'));
        }
    }
}
