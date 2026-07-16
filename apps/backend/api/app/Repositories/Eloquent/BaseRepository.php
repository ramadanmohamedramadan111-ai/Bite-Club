<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Interfaces\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository implements BaseRepositoryInterface
{
    public function __construct(
        protected Model $model
    ) {}

    public function query(): Builder
    {
        return $this->model->newQuery();
    }

    public function find(int $id, array $columns = ['*']): ?Model
    {
        return $this->query()->find($id, $columns);
    }

    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        return $this->query()->findOrFail($id, $columns);
    }

    public function findBy(
        string $column,
        mixed $value,
        string $operator = '=',
        array $columns = ['*']
    ): ?Model {
        return $this->query()
            ->where($column, $operator, $value)
            ->first($columns);
    }

    public function first(
        array $conditions = [],
        array $columns = ['*']
    ): ?Model {
        return $this->query()
            ->where($conditions)
            ->first($columns);
    }

    public function firstOrFail(
        array $conditions = [],
        array $columns = ['*']
    ): Model {
        return $this->query()
            ->where($conditions)
            ->firstOrFail($columns);
    }

    public function get(
        array $conditions = [],
        array $columns = ['*'],
        array $relations = [],
        array $orderBy = []
    ): Collection {
        $query = $this->query();

        if ($conditions) {
            $query->where($conditions);
        }

        if ($relations) {
            $query->with($relations);
        }

        foreach ($orderBy as $column => $direction) {
            $query->orderBy($column, $direction);
        }

        return $query->get($columns);
    }

    public function paginate(
        int $perPage = 15,
        array $conditions = [],
        array $columns = ['*'],
        array $relations = [],
        array $orderBy = []
    ): LengthAwarePaginator {
        $query = $this->query();

        if ($conditions) {
            $query->where($conditions);
        }

        if ($relations) {
            $query->with($relations);
        }

        foreach ($orderBy as $column => $direction) {
            $query->orderBy($column, $direction);
        }

        return $query->paginate($perPage, $columns);
    }

    public function create(array $attributes): Model
    {
        return $this->model->create($attributes);
    }

    public function update(int $id, array $attributes): bool
    {
        if (empty($attributes)) {
            return false;
        }

        return (bool) $this->query()
            ->whereKey($id)
            ->update($attributes);
    }

    public function delete(int $id): bool
    {
        return (bool) $this->query()
            ->whereKey($id)
            ->delete();
    }

    public function exists(array $conditions = []): bool
    {
        return $this->query()
            ->where($conditions)
            ->exists();
    }

    public function count(array $conditions = []): int
    {
        return $this->query()
            ->where($conditions)
            ->count();
    }
}
