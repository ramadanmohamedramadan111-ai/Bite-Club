<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::query()->create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password_hash' => Hash::make('password'),
            'status' => 'active',
            'last_login_at' => now(),
        ]);
    }
}
