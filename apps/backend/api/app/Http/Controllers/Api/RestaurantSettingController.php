<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\RestaurantSetting\IndexRestaurantSettingRequest;
use App\Http\Requests\RestaurantSetting\ShowRestaurantSettingRequest;
use App\Http\Requests\RestaurantSetting\StoreRestaurantSettingRequest;
use App\Http\Requests\RestaurantSetting\UpdateRestaurantSettingRequest;
use App\DTOs\RestaurantSetting\IndexRestaurantSettingDto;
use App\DTOs\RestaurantSetting\ShowRestaurantSettingDto;
use App\DTOs\RestaurantSetting\StoreRestaurantSettingDto;
use App\DTOs\RestaurantSetting\UpdateRestaurantSettingDto;
use App\Services\Application\RestaurantSettingApplicationService;

class RestaurantSettingController extends Controller
{
    public function __construct(
        private RestaurantSettingApplicationService $restaurantSettingApplicationService
    ) {}

    public function index(IndexRestaurantSettingRequest $request): JsonResponse
    {
        try {
            $dto = IndexRestaurantSettingDto::fromValidatedRequest($request);
            $result = $this->restaurantSettingApplicationService->index($dto);

            return $this->successResponse(
                trans('restaurant_setting.list_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to list restaurant settings: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant_setting.list_failed'));
        }
    }

    public function show(ShowRestaurantSettingRequest $request): JsonResponse
    {
        try {
            $dto = ShowRestaurantSettingDto::fromValidatedRequest($request);
            $result = $this->restaurantSettingApplicationService->show($dto);

            return $this->successResponse(
                trans('restaurant_setting.fetch_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant_setting.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to fetch restaurant settings: ' . $e->getMessage(), ['id' => $request->route('id')]);
            return $this->serverErrorResponse(trans('restaurant_setting.fetch_failed'));
        }
    }

    public function store(StoreRestaurantSettingRequest $request): JsonResponse
    {
        try {
            $dto = StoreRestaurantSettingDto::fromValidatedRequest($request);
            $result = $this->restaurantSettingApplicationService->store($dto);

            return $this->createdResponse(
                trans('restaurant_setting.create_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to create restaurant settings: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant_setting.create_failed'));
        }
    }

    public function update(UpdateRestaurantSettingRequest $request): JsonResponse
    {
        try {
            $dto = UpdateRestaurantSettingDto::fromValidatedRequest($request);
            $result = $this->restaurantSettingApplicationService->update($dto);

            return $this->successResponse(
                trans('restaurant_setting.update_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant_setting.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update restaurant settings: ' . $e->getMessage(), ['id' => $request->route('id')]);
            return $this->serverErrorResponse(trans('restaurant_setting.update_failed'));
        }
    }
}
