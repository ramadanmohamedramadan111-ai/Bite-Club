<?php

namespace App\DTOs\User\Restaurant;

use App\Http\Requests\User\Restaurant\NearestRestaurantsRequest;

class NearestRestaurantsDto
{
    public function __construct(
        private float $latitude,
        private float $longitude
    ) {}

    public static function fromValidatedRequest(NearestRestaurantsRequest $request): self
    {
        $data = $request->validated();
        return new self(
            (float) $data['latitude'],
            (float) $data['longitude']
        );
    }

    public function getLatitude(): float
    {
        return $this->latitude;
    }

    public function getLongitude(): float
    {
        return $this->longitude;
    }
}
