<?php

namespace App\Jobs\Ai;

use App\Services\Ai\AiMenuItemSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AiSyncMenuItemJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(
        private readonly array $item,
        private readonly string $event
    ) {}

    public function handle(AiMenuItemSyncService $syncService): void
    {
        $syncService->sync($this->item, $this->event);
    }
}
