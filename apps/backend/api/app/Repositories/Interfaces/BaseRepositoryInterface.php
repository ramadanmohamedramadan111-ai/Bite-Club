<?php

namespace App\Repositories\Interfaces;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface BaseRepositoryInterface
{
    public function query(): Builder;

    public function find(int $id, array $columns = ['*']): ?Model;

    public function findOrFail(int $id, array $columns = ['*']): Model;

    public function findBy(
        string $column,
        mixed $value,
        string $operator = '=',
        array $columns = ['*']
    ): ?Model;

    public function first(
        array $conditions = [],
        array $columns = ['*']
    ): ?Model;

    public function firstOrFail(
        array $conditions = [],
        array $columns = ['*']
    ): Model;

    public function get(
        array $conditions = [],
        array $columns = ['*'],
        array $relations = [],
        array $orderBy = []
    ): Collection;

    public function paginate(
        int $perPage = 15,
        array $conditions = [],
        array $columns = ['*'],
        array $relations = [],
        array $orderBy = []
    ): LengthAwarePaginator;

    public function create(array $attributes): Model;

    public function update(int $id, array $attributes): bool;

    public function delete(int $id): bool;

    public function exists(array $conditions = []): bool;

    public function count(array $conditions = []): int;
}
