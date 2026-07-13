<?php

namespace App\DTOs\Admin\Restaurant;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Http\Requests\Admin\Restaurant\UpdateRestaurantStatusRequest;

class UpdateRestaurantStatusDto
{
    private int $id;
    private RestaurantStatusEnum $status;

    public function __construct(
        int $id,
        RestaurantStatusEnum $status
    ) {
        $this->id = $id;
        $this->status = $status;
    }

    public static function fromValidatedRequest(UpdateRestaurantStatusRequest $request): self
    {
        $data = $request->validated();

        return new self(
            (int) $request->route('id'),
            RestaurantStatusEnum::from($data['status'])
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getStatus(): RestaurantStatusEnum
    {
        return $this->status;
    }
}
