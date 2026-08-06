<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Altering ENUM columns using raw SQL is the safest approach in MySQL.
        DB::statement("ALTER TABLE order_payments MODIFY status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE order_payments MODIFY status ENUM('pending', 'paid', 'failed') DEFAULT 'pending'");
    }
};
