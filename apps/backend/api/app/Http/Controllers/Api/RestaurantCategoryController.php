<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\RestaurantCategory\IndexRestaurantCategoryRequest;
use App\Http\Requests\RestaurantCategory\ShowRestaurantCategoryRequest;
use App\Http\Requests\RestaurantCategory\StoreRestaurantCategoryRequest;
use App\Http\Requests\RestaurantCategory\UpdateRestaurantCategoryRequest;
use App\Http\Requests\RestaurantCategory\DestroyRestaurantCategoryRequest;
use App\DTOs\RestaurantCategory\IndexRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\ShowRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\StoreRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\UpdateRestaurantCategoryDto;
use App\DTOs\RestaurantCategory\DestroyRestaurantCategoryDto;
use App\Services\Application\RestaurantCategoryApplicationService;

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
            Log::error('Failed to list restaurant categories: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant_category.list_failed'));
        }
    }

    public function show(ShowRestaurantCategoryRequest $request): JsonResponse
    {
        try {
            $dto = ShowRestaurantCategoryDto::fromValidatedRequest($request);
            $result = $this->restaurantCategoryApplicationService->show($dto);

            return $this->successResponse(
                trans('restaurant_category.fetch_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant_category.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to fetch restaurant category: ' . $e->getMessage(), ['id' => $request->route('id')]);
            return $this->serverErrorResponse(trans('restaurant_category.fetch_failed'));
        }
    }

    public function store(StoreRestaurantCategoryRequest $request): JsonResponse
    {
        try {
            $dto = StoreRestaurantCategoryDto::fromValidatedRequest($request);
            $result = $this->restaurantCategoryApplicationService->store($dto);

            return $this->createdResponse(
                trans('restaurant_category.create_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to create restaurant category: ' . $e->getMessage(), $request->validated());
            return $this->serverErrorResponse(trans('restaurant_category.create_failed'));
        }
    }

    public function update(UpdateRestaurantCategoryRequest $request): JsonResponse
    {
        try {
            $dto = UpdateRestaurantCategoryDto::fromValidatedRequest($request);
            $result = $this->restaurantCategoryApplicationService->update($dto);

            return $this->successResponse(
                trans('restaurant_category.update_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant_category.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update restaurant category: ' . $e->getMessage(), ['id' => $request->route('id')]);
            return $this->serverErrorResponse(trans('restaurant_category.update_failed'));
        }
    }

    public function destroy(DestroyRestaurantCategoryRequest $request): JsonResponse
    {
        try {
            $dto = DestroyRestaurantCategoryDto::fromValidatedRequest($request);
            $this->restaurantCategoryApplicationService->destroy($dto);

            return $this->successResponse(
                trans('restaurant_category.delete_success')
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant_category.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to delete restaurant category: ' . $e->getMessage(), ['id' => $request->route('id')]);
            return $this->serverErrorResponse(trans('restaurant_category.delete_failed'));
        }
    }
}
