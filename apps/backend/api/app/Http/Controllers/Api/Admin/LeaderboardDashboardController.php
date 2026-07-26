<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Application\Admin\Social\LeaderboardDashboardApplicationService;
use App\Http\Resources\Admin\LeaderboardDashboardResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class LeaderboardDashboardController extends Controller
{
    public function __construct(
        private readonly LeaderboardDashboardApplicationService $leaderboardDashboardApplicationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $stats = $this->leaderboardDashboardApplicationService->getDashboardStats();

            return $this->successResponse(
                'Leaderboard dashboard retrieved successfully.',
                new LeaderboardDashboardResource($stats)
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve leaderboard dashboard stats: ' . $e->getMessage());
            return $this->serverErrorResponse('Failed to retrieve leaderboard dashboard statistics.');
        }
    }
}
