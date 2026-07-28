<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Dashboard\AdminDashboardRequest;
use App\DTOs\Admin\Dashboard\AdminDashboardDto;
use App\Services\Application\Admin\Dashboard\AdminDashboardApplicationService;
use App\Http\Resources\Admin\Dashboard\AdminDashboardResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;

class AdminDashboardController extends Controller
{
    public function __construct(
        private readonly AdminDashboardApplicationService $adminDashboardApplicationService
    ) {}

    public function index(AdminDashboardRequest $request): JsonResponse
    {
        try {
            $dto = AdminDashboardDto::fromValidatedRequest($request);
            $summary = $this->adminDashboardApplicationService->getDashboardSummary($dto->getPeriod());

            return $this->successResponse(
                trans('dashboard.dashboard_retrieved'),
                new AdminDashboardResource($summary)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve admin dashboard stats: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return $this->serverErrorResponse('Failed to retrieve admin dashboard statistics.');
        }
    }
}
