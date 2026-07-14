<?php

namespace App\DTOs\GeneralSetting;

use App\Http\Requests\GeneralSetting\IndexGeneralSettingRequest;

class IndexGeneralSettingDto
{
    private ?int $perPage;
    private ?bool $all;

    public function __construct(?int $perPage = null, ?bool $all = null)
    {
        $this->perPage = $perPage;
        $this->all = $all;
    }

    public static function fromValidatedRequest(IndexGeneralSettingRequest $request): self
    {
        $data = $request->validated();
        return new self(
            isset($data['per_page']) ? (int) $data['per_page'] : null,
            isset($data['all']) ? filter_var($data['all'], FILTER_VALIDATE_BOOLEAN) : null
        );
    }

    public function getPerPage(): ?int
    {
        return $this->perPage;
    }

    public function getAll(): ?bool
    {
        return $this->all;
    }

    public function toArray(): array
    {
        return [
            'per_page' => $this->perPage,
            'all'      => $this->all,
        ];
    }
}
