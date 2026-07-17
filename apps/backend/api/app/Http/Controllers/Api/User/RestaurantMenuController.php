<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Requests\User\Restaurant\ListMenuRequest;
use App\DTOs\User\Restaurant\ListMenuDto;
use App\Services\Application\User\Restaurant\RestaurantMenuApplicationService;

class RestaurantMenuController extends Controller
{
    public function __construct(
        private readonly RestaurantMenuApplicationService $restaurantMenuApplicationService
    ) {}

    public function index(ListMenuRequest $request): JsonResponse
    {
        try {
            $dto = ListMenuDto::fromValidatedRequest($request);
            $result = $this->restaurantMenuApplicationService->listMenu($dto);

            return $this->successResponse(
                trans('restaurant.menu_list_success'),
                $result
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse(trans('restaurant.not_found'));
        } catch (Exception $e) {
            Log::error('Failed to list restaurant menu: ' . $e->getMessage());
            return $this->serverErrorResponse(trans('restaurant.menu_list_failed'));
        }
    }
}
