<?php

namespace App\Jobs\Ai;

use App\Services\Ai\AiReviewSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AiSyncReviewJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        private readonly array $review,
        private readonly string $event
    ) {}

    public function handle(AiReviewSyncService $syncService): void
    {
        $syncService->sync($this->review, $this->event);
    }
}
