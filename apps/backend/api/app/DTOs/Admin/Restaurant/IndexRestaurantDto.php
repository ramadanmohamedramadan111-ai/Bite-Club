<?php

namespace App\DTOs\Admin\Restaurant;

use App\Http\Requests\Admin\Restaurant\IndexRestaurantRequest;

class IndexRestaurantDto
{
    private ?string $name;
    private ?string $category;
    private ?string $status;
    private ?int $perPage;
    private ?bool $all;

    public function __construct(
        ?string $name = null,
        ?string $category = null,
        ?string $status = null,
        ?int $perPage = null,
        ?bool $all = null
    ) {
        $this->name = $name;
        $this->category = $category;
        $this->status = $status;
        $this->perPage = $perPage;
        $this->all = $all;
    }

    public static function fromValidatedRequest(IndexRestaurantRequest $request): self
    {
        $data = $request->validated();

        return new self(
            $data['name'] ?? null,
            $data['category'] ?? null,
            $data['status'] ?? null,
            isset($data['per_page']) ? (int) $data['per_page'] : null,
            isset($data['all']) ? filter_var($data['all'], FILTER_VALIDATE_BOOLEAN) : null
        );
    }

    public function toArray(): array
    {
        return [
            'name'     => $this->name,
            'category' => $this->category,
            'status'   => $this->status,
            'per_page' => $this->perPage,
            'all'      => $this->all,
        ];
    }
}
