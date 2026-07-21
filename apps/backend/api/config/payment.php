<?php

return [
    'kashier' => [
        'base_url' => env('KASHIER_BASE_URL', 'https://test-api.kashier.io'),
        'api_key' => env('KASHIER_API_KEY'),
        'merchant_id' => env('KASHIER_MERCHANT_ID'),
        'webhook_secret' => env('KASHIER_WEBHOOK_SECRET'),
        'currency' => env('KASHIER_CURRENCY', 'EGP'),
    ]
];
