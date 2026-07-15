<?php

namespace App\DTOs\User;

use App\Http\Requests\User\SearchQueryRequest;

class SearchQueryDto
{
    private ?string $search;
    private int $perPage;

    public function __construct(?string $search, int $perPage = 15)
    {
        $this->search = $search;
        $this->perPage = $perPage;
    }

    public static function fromValidatedRequest(SearchQueryRequest $request): self
    {
        $data = $request->validated();
        return new self($data['search'] ?? null, (int) ($data['per_page'] ?? 15));
    }

    public function getSearch(): ?string
    {
        return $this->search;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
        ];
    }
}
