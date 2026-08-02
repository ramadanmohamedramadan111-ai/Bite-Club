<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Frontend URLs
    |--------------------------------------------------------------------------
    |
    | Here we define the base URLs for the various frontend applications
    | interacting with this API.
    |
    */
    'user_url' => env('FRONTEND_USER_URL', 'http://web.localhost:8080'),
    'restaurant_url' => env('FRONTEND_RESTAURANT_URL', 'http://localhost:8081'),
    'admin_url' => env('FRONTEND_ADMIN_URL', 'http://localhost:8082'),

    /*
    |--------------------------------------------------------------------------
    | Specific Frontend Paths
    |--------------------------------------------------------------------------
    |
    | Define reusable paths/routes in the frontend here.
    | Use placeholders like {id} for dynamic replacement.
    |
    */
    'paths' => [
        'user' => [
            'order_tracking' => '/orders/{id}',
        ],
        'restaurant' => [
            // e.g., 'order_details' => '/orders/{id}',
        ],
    ],
];
