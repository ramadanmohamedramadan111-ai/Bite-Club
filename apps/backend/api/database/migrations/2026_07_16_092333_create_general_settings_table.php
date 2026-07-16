<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('general_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('commission_rate', 8, 2)->default(10)->comment('The default platform commission rate percentage taken from restaurants.');
            $table->decimal('service_fee_amount', 8, 2)->default(3)->comment('The default fixed service fee amount charged to customers per order.');
            $table->timestamp('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_settings');
    }
};
