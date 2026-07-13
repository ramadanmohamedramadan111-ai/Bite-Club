<?php

namespace App\Services\Infrastructure\Mail;

use App\Models\User;
use App\Mail\EmailVerificationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class EmailVerificationService
{
    public function generateSignedUrl(User $user): string
    {
        $url = URL::temporarySignedRoute(
            'user.verification.verify',
            now()->addMinutes(60),
            [
                'id'   => $user->id,
                'hash' => sha1($user->email),
            ]
        );

        return str_replace(
            ['http://localhost', 'http://api.localhost'],
            'http://api.localhost:8080',
            $url
        );
    }

    public function sendVerificationEmail(User $user): void
    {
        $verificationUrl = $this->generateSignedUrl($user);

        Mail::to($user->email)->send(new EmailVerificationMail($verificationUrl));
    }
}
