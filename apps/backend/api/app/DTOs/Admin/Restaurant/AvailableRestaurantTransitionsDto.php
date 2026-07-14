<?php

namespace App\DTOs\Admin\Restaurant;

use App\Http\Requests\Admin\Restaurant\AvailableRestaurantTransitionsRequest;

class AvailableRestaurantTransitionsDto
{
    private int $id;

    public function __construct(int $id)
    {
        $this->id = $id;
    }

    public static function fromValidatedRequest(AvailableRestaurantTransitionsRequest $request): self
    {
        return new self((int) $request->route('id'));
    }

    public function getId(): int
    {
        return $this->id;
    }
}
