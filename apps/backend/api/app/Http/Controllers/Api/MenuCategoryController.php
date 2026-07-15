<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\MenuCategory\IndexMenuCategoryRequest;
use App\Http\Requests\MenuCategory\StoreMenuCategoryRequest;
use App\Http\Requests\MenuCategory\UpdateMenuCategoryRequest;
use App\Http\Requests\MenuCategory\UpdateMenuCategoryVisibilityRequest;
use App\Http\Requests\MenuCategory\DestroyMenuCategoryRequest;
use App\DTOs\MenuCategory\IndexMenuCategoryDto;
use App\DTOs\MenuCategory\StoreMenuCategoryDto;
use App\DTOs\MenuCategory\UpdateMenuCategoryDto;
use App\DTOs\MenuCategory\UpdateMenuCategoryVisibilityDto;
use App\DTOs\MenuCategory\DestroyMenuCategoryDto;
use App\Services\Application\MenuCategoryApplicationService;
use App\Traits\ApiResponseTrait;

class MenuCategoryController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private MenuCategoryApplicationService $menuCategoryApplicationService
    ) {}

    public function index(IndexMenuCategoryRequest $request): JsonResponse
    {
        try {
            $dto = IndexMenuCategoryDto::fromValidatedRequest($request);
            $result = $this->menuCategoryApplicationService->index($dto);

            return $this->successResponse(
                trans('menu_category.list_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to list menu categories: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_category.list_failed'));
        }
    }

    public function store(StoreMenuCategoryRequest $request): JsonResponse
    {
        try {
            $dto = StoreMenuCategoryDto::fromValidatedRequest($request);
            $result = $this->menuCategoryApplicationService->store($dto);

            return $this->createdResponse(
                trans('menu_category.create_success'),
                $result
            );
        } catch (Exception $e) {
            Log::error('Failed to create menu category: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_category.create_failed'));
        }
    }

    public function update(UpdateMenuCategoryRequest $request): JsonResponse
    {
        try {
            $dto = UpdateMenuCategoryDto::fromValidatedRequest($request);
            $result = $this->menuCategoryApplicationService->update($dto);

            return $this->successResponse(
                trans('menu_category.update_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('menu_category.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update menu category: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_category.update_failed'));
        }
    }

    public function updateVisibility(UpdateMenuCategoryVisibilityRequest $request): JsonResponse
    {
        try {
            $dto = UpdateMenuCategoryVisibilityDto::fromValidatedRequest($request);
            $result = $this->menuCategoryApplicationService->updateVisibility($dto);

            return $this->successResponse(
                trans('menu_category.update_visibility_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('menu_category.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to update menu category visibility: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_category.update_visibility_failed'));
        }
    }

    public function destroy(DestroyMenuCategoryRequest $request): JsonResponse
    {
        try {
            $dto = DestroyMenuCategoryDto::fromValidatedRequest($request);
            $this->menuCategoryApplicationService->destroy($dto);

            return $this->successResponse(
                trans('menu_category.delete_success')
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('menu_category.not_found'));
        } catch (Exception $e) {
            if ($e->getMessage() === trans('menu_category.has_items')) {
                return $this->errorResponse($e->getMessage());
            }
            Log::error('Failed to delete menu category: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('menu_category.delete_failed'));
        }
    }
}
