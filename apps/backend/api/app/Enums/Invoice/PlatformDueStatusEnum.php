<?php

namespace App\Enums\Invoice;

enum PlatformDueStatusEnum: string
{
    case UNINVOICED = 'uninvoiced';
    case INVOICED = 'invoiced';
}
