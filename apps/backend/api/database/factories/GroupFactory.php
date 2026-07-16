<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\User;
use App\Enums\User\Groups\GroupStatusEnum;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GroupFactory extends Factory
{
    protected $model = Group::class;

    public function definition(): array
    {
        return [
            'owner_user_id'      => User::factory(),
            'name'               => $this->faker->words(2, true) . ' Club',
            'description'        => $this->faker->sentence(),
            'image_url'          => null,
            'invite_token'       => Str::random(32),
            'allow_join_by_link' => true,
            'status'             => GroupStatusEnum::ACTIVE->value,
        ];
    }
}
