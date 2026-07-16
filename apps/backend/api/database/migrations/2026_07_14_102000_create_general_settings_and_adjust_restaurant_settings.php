<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurant_settings', function (Blueprint $table) {
            $table->dropColumn(['commission_rate', 'service_fee_amount']);
        });
    }

    public function down(): void
    {

        Schema::table('restaurant_settings', function (Blueprint $table) {
            $table->decimal('commission_rate', 8, 2)->default(10);
            $table->decimal('service_fee_amount', 8, 2)->default(3);
        });
    }
};
