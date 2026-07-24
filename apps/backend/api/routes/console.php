<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use App\Services\Application\Social\LeaderboardApplicationService;

Schedule::command('loyalty:grant-weekly-rewards')->weeklyOn(2, '00:00');

Schedule::call(function (LeaderboardApplicationService $service) {
    $service->generateWeeklyLeaderboard();
})->weeklyOn(2, '00:00');
