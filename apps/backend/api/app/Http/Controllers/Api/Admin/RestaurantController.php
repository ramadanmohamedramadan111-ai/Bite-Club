<?php

namespace App\Http\Controllers\Api\Admin;

use DomainException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\DTOs\Admin\Restaurant\IndexRestaurantDto;
use App\DTOs\Admin\Restaurant\UpdateRestaurantStatusDto;
use App\Http\Requests\Admin\Restaurant\IndexRestaurantRequest;
use App\Http\Requests\Admin\Restaurant\UpdateRestaurantStatusRequest;
use App\Http\Requests\Admin\Restaurant\AvailableRestaurantTransitionsRequest;
use App\DTOs\Admin\Restaurant\AvailableRestaurantTransitionsDto;
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

    public function availableTransitions(AvailableRestaurantTransitionsRequest $request): JsonResponse
    {
        try {
            $dto = AvailableRestaurantTransitionsDto::fromValidatedRequest($request);
            $statuses = $this->restaurantApplicationService->getAvailableTransitions($dto);

            return $this->successResponse(
                trans('restaurant.available_transitions_success'),
                ['statuses' => $statuses]
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to get available transitions for restaurant: ' . $e->getMessage(), ['restaurant_id' => $request->route('id')]);
            return $this->serverErrorResponse(trans('restaurant.available_transitions_failed'));
        }
    }

    public function updateStatus(UpdateRestaurantStatusRequest $request): JsonResponse
    {
        try {
            $dto = UpdateRestaurantStatusDto::fromValidatedRequest($request);
            $result = $this->restaurantApplicationService->updateStatus($dto);

            if ($result['unchanged']) {
                return $this->successResponse(
                    trans('restaurant.status_already_set'),
                    $result['restaurant']
                );
            }

            return $this->successResponse(
                trans('restaurant.status_update_success'),
                $result['restaurant']
            );
        } catch (DomainException $e) {
            Log::warning('Invalid restaurant status transition: ' . $e->getMessage(), $request->validated());

            return $this->errorResponse(
                trans('restaurant.invalid_status_transition'),
                null,
                422
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update restaurant status: ' . $e->getMessage(), $request->validated());
            return $this->serverErrorResponse(trans('restaurant.status_update_failed'));
        }
    }
}
