<?php

namespace App\DTOs\User\Restaurant;

use App\Http\Requests\User\Restaurant\NearestRestaurantsRequest;

class NearestRestaurantsDto
{
    public function __construct(
        private ?float $latitude,
        private ?float $longitude,
        private int $limit
    ) {}

    public static function fromValidatedRequest(NearestRestaurantsRequest $request): self
    {
        $data = $request->validated();
        return new self(
            isset($data['latitude']) ? (float) $data['latitude'] : null,
            isset($data['longitude']) ? (float) $data['longitude'] : null,
            (int) ($data['limit'] ?? 10)
        );
    }

    public function getLatitude(): ?float
    {
        return $this->latitude;
    }

    public function getLongitude(): ?float
    {
        return $this->longitude;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }
}
