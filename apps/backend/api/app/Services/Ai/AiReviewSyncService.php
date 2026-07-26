<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;

class AiReviewSyncService
{
    public function sync(array $review, string $event): void
    {
        Http::timeout(config('services.ai.timeout'))
            ->withHeaders($this->internalHeaders())
            ->acceptJson()
            ->post($this->url('/api/v1/reviews/sync/'), [
                'event' => $event,
                'review' => $review,
            ])
            ->throw();
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
