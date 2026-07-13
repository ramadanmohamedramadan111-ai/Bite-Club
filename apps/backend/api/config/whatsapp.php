<?php

return [

    'access_token' => env('WHATSAPP_ACCESS_TOKEN'),

    'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),

    'version' => env('WHATSAPP_API_VERSION', 'v23.0'),

    'otp_template' => env('WHATSAPP_OTP_TEMPLATE'),

    'language' => env('WHATSAPP_LANGUAGE', 'en_US'),

];
