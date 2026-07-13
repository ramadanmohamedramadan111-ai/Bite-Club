<?php

namespace Tests\Feature\Auth;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

abstract class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function createAdmin(array $attributes = []): Admin
    {
        return Admin::factory()->create($attributes);
    }

    /**
     * @return array{0: Admin, 1: string}
     */
    protected function loginAdmin(array $attributes = []): array
    {
        $admin = $this->createAdmin($attributes);

        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        $response->assertOk();

        return [$admin->fresh(), $response->json('data.access_token')];
    }
}
