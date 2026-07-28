<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Application\User\Order\OrderApplicationService;

class CancelForgottenPendingOrdersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-forgotten';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel cash orders that have been in PENDING status for longer than the timeout limit without restaurant acceptance.';

    /**
     * Execute the console command.
     */
    public function handle(OrderApplicationService $orderApplicationService): int
    {
        $this->info('Checking for forgotten pending cash orders...');
        
        $timeoutMinutes = (int) config('order.forgotten_pending_timeout_minutes', 40);
        $count = $orderApplicationService->cancelForgottenPendingOrders($timeoutMinutes);
        
        $this->info("Successfully cancelled {$count} forgotten pending cash order(s).");
        
        return Command::SUCCESS;
    }
}
