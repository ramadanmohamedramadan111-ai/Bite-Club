<?php

namespace App\Observers;

use App\Jobs\Ai\AiSyncMenuItemJob;
use App\Models\MenuItem;

class MenuItemObserver
{
    public function created(MenuItem $item): void
    {
        AiSyncMenuItemJob::dispatch($this->itemPayload($item), 'created');
    }

    public function updated(MenuItem $item): void
    {
        AiSyncMenuItemJob::dispatch($this->itemPayload($item), 'updated');
    }

    public function deleted(MenuItem $item): void
    {
        AiSyncMenuItemJob::dispatch($this->itemPayload($item), 'deleted');
    }

    private function itemPayload(MenuItem $item): array
    {
        return [
            'id' => $item->id,
            'restaurant_id' => $item->menuCategory?->restaurant_id,
            'name' => $item->title,
            'description' => $item->description,
            'price' => $item->price,
            'availability' => $item->availability?->value,
            'created_at' => $item->created_at?->toIso8601String(),
            'updated_at' => $item->updated_at?->toIso8601String(),
        ];
    }
}
