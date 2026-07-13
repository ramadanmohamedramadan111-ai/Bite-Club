<?php

namespace App\Services\Infrastructure\Mail;

use App\Mail\ResetPasswordOtpMail;
use Illuminate\Support\Facades\Mail;

class PasswordResetEmailService
{
    public function sendOtpEmail(string $email, string $otp): void
    {
        Mail::to($email)->send(new ResetPasswordOtpMail($otp));
    }
}
