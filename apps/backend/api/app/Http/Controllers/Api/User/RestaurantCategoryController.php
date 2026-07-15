<?php

namespace App\Http\Controllers\Api\User;

use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\User\RestaurantCategory\IndexRestaurantCategoryRequest;
use App\DTOs\User\RestaurantCategory\IndexRestaurantCategoryDto;
use App\Services\Application\User\RestaurantCategoryApplicationService;

class RestaurantCategoryController extends Controller
{
    public function __construct(
        private RestaurantCategoryApplicationService $restaurantCategoryApplicationService
    ) {}

    public function index(IndexRestaurantCategoryRequest $request): JsonResponse
    {
        try {
            $dto = IndexRestaurantCategoryDto::fromValidatedRequest($request);
            $result = $this->restaurantCategoryApplicationService->index($dto);

            return $this->successResponse(
                trans('restaurant_category.list_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to list user restaurant categories: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant_category.list_failed'));
        }
    }
}
