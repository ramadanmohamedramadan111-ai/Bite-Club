<?php

namespace App\Http\Controllers\Api\Ai;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Services\Ai\AiProxyService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Throwable;

class AiChatController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        private readonly AiProxyService $aiProxyService
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'message' => ['required', 'string', 'max:8000'],
                'conversation_id' => ['nullable', 'string', 'max:255'],
                'locale' => ['nullable', 'string', 'max:10'],
            ]);
        } catch (ValidationException $exception) {
            return $this->errorResponse(null, $exception->errors(), 422);
        }

        $restaurant = Auth::guard('restaurant')->user();

        if (!$restaurant instanceof Restaurant) {
            return $this->unauthorizedResponse(trans('restaurant_auth.unauthorized'));
        }

        try {
            $response = $this->aiProxyService->sendChatMessage($restaurant, $validated);

            return $this->successResponse('AI response generated successfully', $response);
        } catch (Throwable $exception) {
            report($exception);

            return $this->serverErrorResponse('AI service is unavailable');
        }
    }
}
