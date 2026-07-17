<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Http\Requests\User\Restaurant\NearestRestaurantsRequest;
use App\Http\Requests\User\Restaurant\ListRestaurantsRequest;
use App\DTOs\User\Restaurant\NearestRestaurantsDto;
use App\DTOs\User\Restaurant\ListRestaurantsDto;
use App\Services\Application\User\Restaurant\RestaurantApplicationService;

class RestaurantController extends Controller
{
    public function __construct(
        private RestaurantApplicationService $restaurantApplicationService
    ) {}

    public function index(ListRestaurantsRequest $request): JsonResponse
    {
        try {
            $dto = ListRestaurantsDto::fromValidatedRequest($request);
            $result = $this->restaurantApplicationService->listRestaurants($dto);

            return $this->successResponse(
                trans('restaurant.list_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to list restaurants: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant.list_failed'));
        }
    }

    public function nearest(NearestRestaurantsRequest $request): JsonResponse
    {
        try {
            $dto = NearestRestaurantsDto::fromValidatedRequest($request);
            $result = $this->restaurantApplicationService->getNearest($dto);

            return $this->successResponse(
                trans('restaurant.nearest_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to get nearest restaurants: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant.nearest_failed'));
        }
    }
}
