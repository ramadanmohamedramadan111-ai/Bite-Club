<?php

namespace App\DTOs\RestaurantSetting;

use App\Http\Requests\RestaurantSetting\ShowRestaurantSettingRequest;

class ShowRestaurantSettingDto
{
    private int $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public static function fromValidatedRequest(ShowRestaurantSettingRequest $request): self
    {
        return new self((int) $request->route('id'));
    }

    public function getId(): int
    {
        return $this->id;
    }
}
