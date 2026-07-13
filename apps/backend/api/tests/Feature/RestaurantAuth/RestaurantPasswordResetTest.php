<?php

namespace Tests\Feature\RestaurantAuth;

use App\Models\Restaurant;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\Restaurant\ResetPasswordMail;
use Tests\Feature\RestaurantAuth\RestaurantAuthTest;

class RestaurantPasswordResetTest extends RestaurantAuthTest
{
    public function test_restaurant_can_request_password_reset_link(): void
    {
        // Arrange
        Mail::fake();
        $restaurant = $this->createRestaurant();

        $payload = [
            'email' => $restaurant->email,
        ];

        // Act
        $response = $this->postJson('/api/restaurant/forgot-password', $payload);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);
        
        Mail::assertSent(ResetPasswordMail::class, function ($mail) use ($restaurant) {
            return $mail->hasTo($restaurant->email);
        });
    }

    public function test_restaurant_can_reset_password_with_valid_token(): void
    {
        // Arrange
        $restaurant = $this->createRestaurant([
            'password_hash' => Hash::make('oldpassword'),
        ]);

        $token = Password::broker('restaurants')->createToken($restaurant);

        $payload = [
            'email' => $restaurant->email,
            'token' => $token,
            'password' => 'newPassword123',
            'password_confirmation' => 'newPassword123',
        ];

        // Act
        $response = $this->postJson('/api/restaurant/reset-password', $payload);

        // Assert
        $response->assertOk();
        $response->assertJsonPath('success', true);

        // Verify password was changed
        $this->assertTrue(Hash::check('newPassword123', $restaurant->fresh()->password_hash));
    }

    public function test_fails_to_reset_with_invalid_token(): void
    {
        // Arrange
        $restaurant = $this->createRestaurant([
            'password_hash' => Hash::make('oldpassword'),
        ]);

        $payload = [
            'email' => $restaurant->email,
            'token' => 'invalid-token',
            'password' => 'newPassword123',
            'password_confirmation' => 'newPassword123',
        ];

        // Act
        $response = $this->postJson('/api/restaurant/reset-password', $payload);

        // Assert
        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
    }
}
