<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Application\Loyalty\WeeklyStreakApplicationService;

class GrantWeeklyStreakRewardsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'loyalty:grant-weekly-rewards';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Grant weekly streak rewards and badges to eligible users for past weeks.';

    /**
     * Execute the console command.
     */
    public function handle(WeeklyStreakApplicationService $weeklyStreakService): int
    {
        $this->info('Starting to grant weekly streak rewards and badges...');
        
        $weeklyStreakService->grantWeeklyRewards();
        
        $this->info('Weekly streak rewards and badges granted successfully.');
        
        return Command::SUCCESS;
    }
}
