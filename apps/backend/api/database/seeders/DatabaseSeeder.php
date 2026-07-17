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
        $this->call([
            AdminSeeder::class,
            GeneralSettingSeeder::class,
            RestaurantSeeder::class,
            RestaurantMenuSeeder::class,
        ]);

        User::factory()->create([
            'phone_number' => '01000000000',
            'username' => 'testuser',
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'referral_code' => 'REF-00001',
        ]);
    }
}
