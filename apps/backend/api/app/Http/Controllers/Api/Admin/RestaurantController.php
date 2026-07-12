<?php

namespace App\Http\Controllers\Api\Admin;

use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\DTOs\Admin\Restaurant\IndexRestaurantDto;
use App\Http\Requests\Admin\Restaurant\IndexRestaurantRequest;
use App\Services\Application\Admin\RestaurantApplicationService;

class RestaurantController extends Controller
{
    public function __construct(
        private RestaurantApplicationService $restaurantApplicationService
    ) {}

    public function index(IndexRestaurantRequest $request): JsonResponse
    {
        try {
            $dto = IndexRestaurantDto::fromValidatedRequest($request);
            $result = $this->restaurantApplicationService->index($dto);

            return $this->successResponse(
                trans('restaurant.list_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to list restaurants: ' . $e->getMessage(), $request->validated());
            return $this->serverErrorResponse(trans('restaurant.list_failed'));
        }
    }
}
