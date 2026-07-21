<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\Social\LeaderboardTypeEnum;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leaderboards', function (Blueprint $table) {
            $table->id();
            $table->enum('type', LeaderboardTypeEnum::values())->default(LeaderboardTypeEnum::WEEKLY->value);
            $table->timestamp('period_start');
            $table->timestamp('period_end');
            $table->unsignedInteger('rank');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('copies')->default(0);
            $table->unsignedInteger('reward_points')->default(0);
            $table->timestamps();

            $table->index(['type', 'period_start', 'rank']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaderboards');
    }
};
