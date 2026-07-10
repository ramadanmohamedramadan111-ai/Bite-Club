<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'phone_number' => '01000000000',
            'username' => 'testuser',
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'referral_code' => 'REF-00001',
        ]);
    }
}
