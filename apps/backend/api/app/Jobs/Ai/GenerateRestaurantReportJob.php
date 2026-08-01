<?php

namespace App\Jobs\Ai;

use App\Models\Restaurant;
use App\Models\RestaurantReport;
use App\Services\Ai\AiProxyService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateRestaurantReportJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        private readonly Restaurant $restaurant
    ) {}

    public function handle(AiProxyService $aiProxyService): void
    {
        try {
            $reportEn = $aiProxyService->sendChatMessage($this->restaurant, [
                'message' => 'Generate report',
                'locale' => 'en',
            ]);

            $reportAr = $aiProxyService->sendChatMessage($this->restaurant, [
                'message' => 'Generate report',
                'locale' => 'ar',
            ]);

            RestaurantReport::updateOrCreate(
                [
                    'restaurant_id' => $this->restaurant->id,
                    'report_date' => now()->toDateString(),
                ],
                [
                    'report_en' => $reportEn,
                    'report_ar' => $reportAr,
                ]
            );
        } catch (Throwable $e) {
            Log::error("Failed to generate daily reports for restaurant {$this->restaurant->id}: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }
}
