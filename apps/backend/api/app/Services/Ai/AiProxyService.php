<?php

namespace App\Services\Ai;

use App\Models\Restaurant;
use Illuminate\Support\Facades\Http;

class AiProxyService
{
    public function sendChatMessage(Restaurant $restaurant, array $payload): array
    {
        $response = Http::timeout(config('services.ai.timeout'))
            ->withHeaders($this->internalHeaders())
            ->acceptJson()
            ->post($this->url('/api/v1/chat/'), [
                'message' => $payload['message'],
                'user_id' => $restaurant->id,
                'restaurant_id' => $restaurant->id,
                'locale' => $payload['locale'] ?? app()->getLocale(),
                'conversation_id' => $payload['conversation_id'] ?? null,
            ]);

        $response->throw();

        return $response->json();
    }

    public function sendSmartWaiterChatMessage(Restaurant $restaurant, array $payload): array
    {
        $response = Http::timeout(config('services.ai.timeout'))
            ->withHeaders($this->internalHeaders())
            ->acceptJson()
            ->post($this->url('/api/v1/smart-waiter/chat/'), [
                'message' => $payload['message'],
                'restaurant_id' => $restaurant->id,
                'user_id' => $payload['user_id'] ?? null,
                'budget' => $payload['budget'] ?? null,
                'group_size' => $payload['group_size'] ?? 1,
                'locale' => $payload['locale'] ?? app()->getLocale(),
                'conversation_id' => $payload['conversation_id'] ?? null,
            ]);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'error' => 'Smart Waiter AI request failed.',
            'status' => $response->status(),
            'body' => $response->json() ?? $response->body(),
        ];
    }

    private function url(string $path): string

    {
        return rtrim(config('services.ai.service_url'), '/') . $path;
    }

    private function internalHeaders(): array
    {
        $key = config('services.ai.internal_api_key');

        return $key ? ['X-Internal-API-Key' => $key] : [];
    }
}
