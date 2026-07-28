<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\Application\User\Order\OrderApplicationService;

class CancelExpiredOrdersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel orders that have been awaiting online payment for longer than the session timeout limit.';

    /**
     * Execute the console command.
     */
    public function handle(OrderApplicationService $orderApplicationService): int
    {
        $this->info('Checking for expired unpaid orders...');
        
        $timeoutMinutes = (int) config('payment.kashier.session_timeout_minutes', 60);
        $count = $orderApplicationService->cancelExpiredUnpaidOrders($timeoutMinutes);
        
        $this->info("Successfully cancelled {$count} expired unpaid order(s).");
        
        return Command::SUCCESS;
    }
}
