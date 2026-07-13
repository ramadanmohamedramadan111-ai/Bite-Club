<?php

namespace App\DTOs\Auth;

use App\Http\Requests\Auth\SendOtpRequest;

class SendOtpDto
{
    public function __construct(
        private string $phoneNumber
    ) {}

    public static function fromValidatedRequest(
        SendOtpRequest $request
    ): self {
        return new self(
            $request->validated('phone_number')
        );
    }

    public function getPhoneNumber(): string
    {
        return $this->phoneNumber;
    }
}
