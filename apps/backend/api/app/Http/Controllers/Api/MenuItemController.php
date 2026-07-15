<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\MenuItem\IndexMenuItemRequest;
use App\Http\Requests\MenuItem\StoreMenuItemRequest;
use App\Http\Requests\MenuItem\UpdateMenuItemRequest;
use App\Http\Requests\MenuItem\UpdateMenuItemAvailabilityRequest;
use App\Http\Requests\MenuItem\DestroyMenuItemRequest;
use App\DTOs\MenuItem\IndexMenuItemDto;
use App\DTOs\MenuItem\StoreMenuItemDto;
use App\DTOs\MenuItem\UpdateMenuItemDto;
use App\DTOs\MenuItem\UpdateMenuItemAvailabilityDto;
use App\DTOs\MenuItem\DestroyMenuItemDto;
use App\Services\Application\MenuItemApplicationService;
use App\Traits\ApiResponseTrait;

class MenuItemController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private MenuItemApplicationService $menuItemApplicationService
    ) {}

    public function index(IndexMenuItemRequest $request): JsonResponse
    {
        try {
            $dto = IndexMenuItemDto::fromValidatedRequest($request);
            $result = $this->menuItemApplicationService->index($dto);

            return $this->successResponse(
                trans('menu_item.list_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to list menu items: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_item.list_failed'));
        }
    }

    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        try {
            $dto = StoreMenuItemDto::fromValidatedRequest($request);
            $result = $this->menuItemApplicationService->store($dto);

            return $this->createdResponse(
                trans('menu_item.create_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('menu_category.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to create menu item: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_item.create_failed'));
        }
    }

    public function update(UpdateMenuItemRequest $request): JsonResponse
    {
        try {
            $dto = UpdateMenuItemDto::fromValidatedRequest($request);
            $result = $this->menuItemApplicationService->update($dto);

            return $this->successResponse(
                trans('menu_item.update_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('menu_item.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update menu item: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_item.update_failed'));
        }
    }

    public function updateAvailability(UpdateMenuItemAvailabilityRequest $request): JsonResponse
    {
        try {
            $dto = UpdateMenuItemAvailabilityDto::fromValidatedRequest($request);
            $result = $this->menuItemApplicationService->updateAvailability($dto);

            return $this->successResponse(
                trans('menu_item.update_availability_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('menu_item.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update menu item availability: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_item.update_availability_failed'));
        }
    }

    public function destroy(DestroyMenuItemRequest $request): JsonResponse
    {
        try {
            $dto = DestroyMenuItemDto::fromValidatedRequest($request);
            $this->menuItemApplicationService->destroy($dto);

            return $this->successResponse(
                trans('menu_item.delete_success')
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('menu_item.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to delete menu item: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_item.delete_failed'));
        }
    }
}
