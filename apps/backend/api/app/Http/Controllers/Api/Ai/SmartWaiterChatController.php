<?php

namespace App\Http\Controllers\Api\Ai;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Restaurant;
use App\Services\Ai\AiProxyService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Throwable;

class SmartWaiterChatController extends Controller
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
                'restaurant_id' => ['nullable', 'integer', 'exists:restaurants,id'],
                'budget' => ['nullable', 'numeric', 'min:0'],
                'group_size' => ['nullable', 'integer', 'min:1'],
                'conversation_id' => ['nullable', 'string', 'max:255'],
                'locale' => ['nullable', 'string', 'max:10'],
            ]);
        } catch (ValidationException $exception) {
            return $this->errorResponse(null, $exception->errors(), 422);
        }

        $user = Auth::guard('user')->user() ?? Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated user. Bearer token is required.');
        }

        // Automatically bind authenticated user_id
        $validated['user_id'] = $user->id;

        // Resolve restaurant_id if not explicitly provided in payload
        $restaurantId = $validated['restaurant_id'] ?? null;

        if (!$restaurantId) {
            // Check user's active cart
            $restaurantId = Cart::where('user_id', $user->id)->value('restaurant_id');
        }

        if (!$restaurantId) {
            // Check user's latest order
            $restaurantId = Order::where('user_id', $user->id)->latest()->value('restaurant_id');
        }

        if (!$restaurantId) {
            // Fallback to active restaurant
            $restaurantId = Restaurant::query()->where('status', 'active')->value('id') ?? Restaurant::query()->value('id');
        }

        $restaurant = Restaurant::find($restaurantId);
        if (!$restaurant) {
            return $this->notFoundResponse('Restaurant not found');
        }

        try {
            $response = $this->aiProxyService->sendSmartWaiterChatMessage($restaurant, $validated);

            if (isset($response['error'])) {
                return $this->errorResponse(
                    $response['error'],
                    ['upstream' => $response['body'] ?? null, 'status' => $response['status'] ?? null],
                    502
                );
            }

            if (is_array($response)) {
                $response['restaurant_id'] = $restaurant->id;
                $response['restaurant_name'] = $restaurant->name;
            }

            return $this->successResponse('Smart Waiter recommendation generated successfully', $response);
        } catch (Throwable $exception) {
            report($exception);

            return $this->serverErrorResponse(
                'Smart Waiter AI service is unavailable: ' . $exception->getMessage()
            );
        }
    }
}
