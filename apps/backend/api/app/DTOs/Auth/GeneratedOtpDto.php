<?php

namespace App\DTOs\Auth;

use App\Models\PhoneVerification;

class GeneratedOtpDto
{
    public function __construct(
        private PhoneVerification $verification,
        private string $plainOtp
    ) {}

    public function getVerification(): PhoneVerification
    {
        return $this->verification;
    }

    public function getPlainOtp(): string
    {
        return $this->plainOtp;
    }
}
