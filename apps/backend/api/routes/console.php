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

Schedule::command('orders:cancel-expired')->everyFifteenMinutes();
Schedule::command('orders:cancel-forgotten')->everyFifteenMinutes();

// Generate platform invoices on the 1st day of every month at midnight
Schedule::command('invoices:generate')->monthlyOn(1, '00:00');

// Check for overdue invoices every day at 01:00 AM
Schedule::command('invoices:check-overdue')->dailyAt('01:00');

use App\Jobs\Ai\GenerateDailyReportsJob;

Schedule::job(new GenerateDailyReportsJob)->dailyAt('00:00');

Artisan::command('reports:generate', function () {
    $this->info('Starting reports generation...');
    $job = new GenerateDailyReportsJob();
    $job->handle();
    $this->info('Daily reports generation completed.');
})->purpose('Generate daily AI reports for all active restaurants');

