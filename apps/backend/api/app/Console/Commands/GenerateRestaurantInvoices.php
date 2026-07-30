<?php

namespace App\Console\Commands;

use \App\Services\Domain\Invoice\InvoiceDomainService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

class GenerateRestaurantInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly invoices for restaurants from their platform dues';

    /**
     * Execute the console command.
     */
    public function handle(InvoiceDomainService $invoiceDomainService)
    {
        $this->info('Starting invoice generation...');
        $count = $invoiceDomainService->generateMonthlyInvoices();
        $this->info("Successfully generated {$count} invoices.");
    }
}
