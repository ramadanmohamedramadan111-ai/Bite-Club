<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurant_settings', function (Blueprint $table) {
            $table->string('kashier_api_key')->nullable()->after('deposit_percentage');
            $table->string('kashier_merchant_id')->nullable()->after('kashier_api_key');
            $table->string('kashier_webhook_secret')->nullable()->after('kashier_merchant_id');
        });
    }

    public function down(): void
    {
        Schema::table('restaurant_settings', function (Blueprint $table) {
            $table->dropColumn([
                'kashier_api_key',
                'kashier_merchant_id',
                'kashier_webhook_secret'
            ]);
        });
    }
};
