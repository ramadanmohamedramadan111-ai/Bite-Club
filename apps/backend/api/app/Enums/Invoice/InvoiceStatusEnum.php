<?php

namespace App\Enums\Invoice;

enum InvoiceStatusEnum: string
{
    case UNPAID = 'unpaid';
    case PAID = 'paid';
    case OVERDUE = 'overdue';
}
