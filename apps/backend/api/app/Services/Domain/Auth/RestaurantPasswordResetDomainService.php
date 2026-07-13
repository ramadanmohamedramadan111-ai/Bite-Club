<?php

namespace App\Services\Domain\Auth;

use Exception;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;

class RestaurantPasswordResetDomainService
{
    /**
     * Send the password reset link.
     */
    public function sendResetLink(string $email): string
    {
        $status = Password::broker('restaurants')->sendResetLink(
            ['email' => $email]
        );

        if ($status !== Password::RESET_LINK_SENT) {
            throw new Exception(__($status));
        }

        return $status;
    }

    /**
     * Reset the user's password.
     */
    public function resetPassword(string $email, string $token, string $password): string
    {
        $status = Password::broker('restaurants')->reset(
            [
                'email' => $email,
                'token' => $token,
                'password' => $password,
                'password_confirmation' => $password, // Passing confirmation just in case the broker expects it.
            ],
            function (Restaurant $restaurant, string $password) {
                $restaurant->password_hash = Hash::make($password);
                $restaurant->save();

                event(new PasswordReset($restaurant));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw new Exception(__($status));
        }

        return $status;
    }
}
