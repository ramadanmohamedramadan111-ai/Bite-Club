<?php

namespace App\DTOs\Auth;

use App\Http\Requests\Auth\VerifyResetOtpRequest;

class VerifyResetOtpDto
{
    public function __construct(
        private string $email,
        private string $otp
    ) {}

    public static function fromValidatedRequest(VerifyResetOtpRequest $request): self
    {
        return new self(
            $request->validated('email'),
            $request->validated('otp')
        );
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getOtp(): string
    {
        return $this->otp;
    }
}
