<?php

namespace Tests\Feature\Auth;

class AdminLoginTest extends AdminAuthTest
{
    public function test_admin_can_login_and_receive_token_payload(): void
    {
        // Arrange
        $admin = $this->createAdmin();

        // Act
        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        // Assert
        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'access_token',
                'token_type',
                'expires_in',
            ],
        ]);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('message', trans('auth.login_success'));
        $response->assertJsonPath('data.token_type', 'Bearer');
        $response->assertJsonPath('data.expires_in', config('jwt.ttl') * 60);

        $accessToken = $response->json('data.access_token');
        $this->assertIsString($accessToken);
        $this->assertNotSame('', $accessToken);

        $admin->refresh();
        $this->assertNotNull($admin->last_login_at);
    }

    public function test_admin_login_fails_with_invalid_credentials(): void
    {
        // Arrange
        $this->createAdmin();

        // Act
        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@admin.com',
            'password' => 'wrong-password',
        ]);

        // Assert
        $response->assertUnauthorized();
        $response->assertJsonPath('success', false);
        $response->assertJsonPath('message', trans('auth.failed'));
    }

    public function test_admin_login_validates_required_fields(): void
    {
        // Arrange
        $payload = [];

        // Act
        $response = $this->postJson('/api/admin/login', $payload);

        // Assert
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email', 'password']);
    }
}
