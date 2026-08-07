<?php

namespace App\Http\Controllers\Api\Ai;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SmartWaiterRemainingController extends Controller
{
    use ApiResponseTrait;

    public function __invoke(): JsonResponse
    {
        $user = Auth::guard('user')->user() ?? Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated user. Bearer token is required.');
        }

        $cacheKey = "user:ai-messages-limit:" . $user->id . ":" . date('Y-m-d');
        $messageCount = cache()->get($cacheKey, 0);
        $remaining = max(0, 15 - $messageCount);

        return $this->successResponse('Remaining messages retrieved successfully', [
            'remaining_messages' => $remaining,
            'max_messages' => 15,
        ]);
    }
}
