<?php

namespace App\Services\Infrastructure\Twilio;

use Exception;
use Twilio\Rest\Client;

class TwilioVerifyService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client(
            config('twilio.account_sid'),
            config('twilio.auth_token'),
        );
    }

    public function sendOtp(string $phoneNumber): void
    {
        $this->client
            ->verify
            ->v2
            ->services(config('twilio.verify_service_sid'))
            ->verifications
            ->create(
                $this->formatPhoneNumber($phoneNumber),
                'sms'
            );
    }

    public function verifyOtp(
        string $phoneNumber,
        string $code
    ): void {

        $verification = $this->client
            ->verify
            ->v2
            ->services(config('twilio.verify_service_sid'))
            ->verificationChecks
            ->create([
                'to'   => $this->formatPhoneNumber($phoneNumber),
                'code' => $code,
            ]);

        if ($verification->status !== 'approved') {
            throw new Exception(
                trans('auth.invalid_otp')
            );
        }
    }

    private function formatPhoneNumber(string $phoneNumber): string
    {
        if (str_starts_with($phoneNumber, '+')) {
            return $phoneNumber;
        }

        if (str_starts_with($phoneNumber, '0')) {
            return '+2' . $phoneNumber;
        }

        throw new Exception('Invalid phone number format.');
    }
}
