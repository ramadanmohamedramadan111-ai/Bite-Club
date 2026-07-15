<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn('is_available');
            $table->string('availability')->default(MenuItemAvailabilityEnum::AVAILABLE->value)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn('availability');
            $table->boolean('is_available')->default(true)->after('price');
        });
    }
};
