<?php

namespace App\Http\Controllers\Api\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Restaurant\Dashboard\RestaurantDashboardRequest;
use App\DTOs\Restaurant\Dashboard\RestaurantDashboardDto;
use App\Services\Application\Restaurant\Dashboard\RestaurantDashboardApplicationService;
use Illuminate\Http\JsonResponse;

class RestaurantDashboardController extends Controller
{
    public function __construct(
        private readonly RestaurantDashboardApplicationService $dashboardService
    ) {}

    public function index(RestaurantDashboardRequest $request): JsonResponse
    {
        $dto = RestaurantDashboardDto::fromValidatedRequest($request);

        $data = $this->dashboardService->getDashboardData($dto);

        return $this->successResponse(
            trans('restaurant.dashboard_retrieved') ?? 'Dashboard data retrieved successfully',
            $data
        );
    }
}
