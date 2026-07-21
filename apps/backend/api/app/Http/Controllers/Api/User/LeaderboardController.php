<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\Application\Social\LeaderboardApplicationService;
use App\Http\Resources\Social\LeaderboardResource;
use Exception;
use Illuminate\Support\Facades\Log;

class LeaderboardController extends Controller
{
    public function __construct(
        private readonly LeaderboardApplicationService $leaderboardApplicationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $type = $request->query('type', 'weekly');
            $leaderboards = $this->leaderboardApplicationService->getLeaderboard($type);

            return $this->successResponse(
                'Leaderboard retrieved successfully.',
                [
                    'items' => LeaderboardResource::collection($leaderboards->items()),
                    'meta'  => [
                        'current_page' => $leaderboards->currentPage(),
                        'per_page'     => $leaderboards->perPage(),
                        'total'        => $leaderboards->total(),
                        'last_page'    => $leaderboards->lastPage(),
                    ],
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to retrieve leaderboard: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
