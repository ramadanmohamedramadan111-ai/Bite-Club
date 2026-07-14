<?php

namespace App\Services\Domain\GeneralSetting;

use App\Models\GeneralSetting;
use App\Repositories\Interfaces\GeneralSettingRepositoryInterface;

class GeneralSettingDomainService
{
    public function __construct(
        private GeneralSettingRepositoryInterface $generalSettingRepository
    ) {}

    public function list(array $filters): array
    {
        $perPage = isset($filters['per_page']) ? (int) $filters['per_page'] : 15;

        if (isset($filters['all']) && filter_var($filters['all'], FILTER_VALIDATE_BOOLEAN) === true) {
            $settings = $this->generalSettingRepository->get(orderBy: ['id' => 'desc']);
            return [
                'items' => $settings
            ];
        }

        $paginator = $this->generalSettingRepository->paginate(
            perPage: $perPage,
            orderBy: ['id' => 'desc']
        );

        return [
            'items' => collect($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ]
        ];
    }

    public function findOrFail(int $id): GeneralSetting
    {
        return $this->generalSettingRepository->findOrFail($id);
    }

    public function update(int $id, array $data): GeneralSetting
    {
        $this->generalSettingRepository->update($id, $data);
        return $this->findOrFail($id);
    }

    public function create(array $data): GeneralSetting
    {
        return $this->generalSettingRepository->create($data);
    }
}
