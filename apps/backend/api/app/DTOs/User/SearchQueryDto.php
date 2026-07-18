<?php

namespace App\DTOs\User;

use App\Http\Requests\User\SearchQueryRequest;

class SearchQueryDto
{
    private ?string $search;
    private int $perPage;
    private ?string $status;

    public function __construct(?string $search, int $perPage = 15, ?string $status = null)
    {
        $this->search = $search;
        $this->perPage = $perPage;
        $this->status = $status;
    }

    public static function fromValidatedRequest(SearchQueryRequest $request): self
    {
        $data = $request->validated();
        return new self($data['search'] ?? null, (int) ($data['per_page'] ?? 15), $data['status'] ?? null);
    }

    public function getSearch(): ?string
    {
        return $this->search;
    }

    public function getPerPage(): int
    {
        return $this->perPage;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
        ];
    }
}
