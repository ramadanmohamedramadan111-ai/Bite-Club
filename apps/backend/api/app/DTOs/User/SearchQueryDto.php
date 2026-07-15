<?php

namespace App\DTOs\User;

use App\Http\Requests\User\SearchQueryRequest;

class SearchQueryDto
{
    private ?string $search;

    public function __construct(?string $search)
    {
        $this->search = $search;
    }

    public static function fromValidatedRequest(SearchQueryRequest $request): self
    {
        $data = $request->validated();
        return new self($data['search'] ?? null);
    }

    public function getSearch(): ?string
    {
        return $this->search;
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
        ];
    }
}
