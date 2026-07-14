<x-mail::message>
# Introduction

You are receiving this email because we received a password reset request for your restaurant account.

<x-mail::button :url="env('FRONTEND_URL', 'http://web.localhost:8080') . '/reset-password?token=' . $token . '&email=' . urlencode($email)">
Reset Password
</x-mail::button>

If you did not request a password reset, no further action is required.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
