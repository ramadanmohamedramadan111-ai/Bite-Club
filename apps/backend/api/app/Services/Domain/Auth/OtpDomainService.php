<?php

namespace App\Services\Domain\Auth;

use App\Services\Infrastructure\Twilio\TwilioVerifyService;

class OtpDomainService
{
    public function __construct(
        private TwilioVerifyService $twilioVerifyService,
    ) {}

    public function sendOtp(
        string $phoneNumber
    ): void {

        $this->twilioVerifyService
            ->sendOtp($phoneNumber);
    }

    public function verifyOtp(
        string $phoneNumber,
        string $otp
    ): void {

        $this->twilioVerifyService
            ->verifyOtp(
                $phoneNumber,
                $otp
            );
    }
}
