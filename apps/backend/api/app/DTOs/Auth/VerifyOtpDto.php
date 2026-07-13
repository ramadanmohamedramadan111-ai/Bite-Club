<?php

namespace App\DTOs\Auth;

use App\Http\Requests\Auth\VerifyOtpRequest;

class VerifyOtpDto
{
    public function __construct(
        private string $phoneNumber,
        private string $otp
    ) {}

    public static function fromValidatedRequest(
        VerifyOtpRequest $request
    ): self {
        return new self(
            $request->validated('phone_number'),
            $request->validated('otp'),
        );
    }

    public function getPhoneNumber(): string
    {
        return $this->phoneNumber;
    }

    public function getOtp(): string
    {
        return $this->otp;
    }
}
