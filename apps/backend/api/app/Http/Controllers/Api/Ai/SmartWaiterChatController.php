<?php

namespace App\Http\Controllers\Api\Ai;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
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
                'conversation_id' => ['nullable', 'integer', 'exists:conversations,id'],
                'new_chat' => ['nullable', 'boolean'],
                'latitude' => ['nullable', 'numeric'],
                'longitude' => ['nullable', 'numeric'],
                'budget' => ['nullable', 'numeric', 'min:0'],
                'group_size' => ['nullable', 'integer', 'min:1'],
                'locale' => ['nullable', 'string', 'max:10'],
            ]);
        } catch (ValidationException $exception) {
            return $this->errorResponse(null, $exception->errors(), 422);
        }

        $user = Auth::guard('user')->user() ?? Auth::user();
        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated user. Bearer token is required.');
        }

        $validated['user_id'] = $user->id;

        $isNewChat = $validated['new_chat'] ?? false;
        $conversationId = $validated['conversation_id'] ?? null;
        
        if ($isNewChat || !$conversationId) {
            $conversation = Conversation::create(['user_id' => $user->id]);
            $conversationId = $conversation->id;
        } else {
            $conversation = Conversation::where('user_id', $user->id)->find($conversationId);
            if (!$conversation) {
                $conversation = Conversation::create(['user_id' => $user->id]);
                $conversationId = $conversation->id;
            }
        }

        $validated['conversation_id'] = $conversationId;

        $conversation->messages()->create([
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        // Get History (Latest 10 messages)
        $history = $conversation->messages()
            ->latest()
            ->take(10)
            ->get()
            ->reverse()
            ->map(fn($msg) => [
                'role' => $msg->role,
                'content' => $msg->content,
            ])
            ->values()
            ->toArray();

        $validated['conversation'] = $history;

        try {
            $response = $this->aiProxyService->sendSmartWaiterChatMessage($validated);

            if (is_array($response) && isset($response['reply'])) {
                $conversation->messages()->create([
                    'role' => 'assistant',
                    'content' => $response['reply'],
                ]);
            }
            
            $response['conversation_id'] = $conversationId;

            return $this->successResponse('Smart Waiter recommendation generated successfully', $response);
        } catch (Throwable $exception) {
            report($exception);

            return $this->serverErrorResponse('Smart Waiter AI service is unavailable');
        }
    }
}

