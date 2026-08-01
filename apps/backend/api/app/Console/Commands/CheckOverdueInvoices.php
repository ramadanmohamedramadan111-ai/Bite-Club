<?php

namespace App\Console\Commands;

use \App\Services\Domain\Invoice\InvoiceDomainService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

class CheckOverdueInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:check-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for unpaid invoices that have passed their due date and suspend the associated restaurants';

    /**
     * Execute the console command.
     */
    public function handle(InvoiceDomainService $invoiceDomainService)
    {
        $this->info('Checking for overdue invoices...');
        $count = $invoiceDomainService->checkAndProcessOverdueInvoices();
        $this->info("Found {$count} overdue invoices. Associated restaurants have been suspended.");
    }
}
