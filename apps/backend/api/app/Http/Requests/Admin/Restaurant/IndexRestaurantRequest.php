<?php

namespace App\Http\Requests\Admin\Restaurant;

use App\Enums\Restaurant\RestaurantStatusEnum;
use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class IndexRestaurantRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('all')) {
            $data['all'] = filter_var($this->input('all'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        if ($this->has('name') && is_string($this->input('name'))) {
            $data['name'] = trim($this->input('name'));
        }

        if ($this->has('category') && is_string($this->input('category'))) {
            $data['category'] = trim($this->input('category'));
        }

        if ($this->has('status') && is_string($this->input('status'))) {
            $data['status'] = trim(strtolower($this->input('status')));
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        return [
            'name'     => ['sometimes', 'nullable', 'string', 'max:255'],
            'category' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status'   => ['sometimes', 'nullable', 'string', Rule::in(array_map(fn ($case) => $case->value, RestaurantStatusEnum::cases()))],
            'per_page' => ['sometimes', 'integer', 'min:1'],
            'all'      => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.string'     => trans('validation.string', ['attribute' => 'name']),
            'name.max'        => trans('validation.max.string', ['attribute' => 'name', 'max' => 255]),
            'category.string' => trans('validation.string', ['attribute' => 'category']),
            'category.max'    => trans('validation.max.string', ['attribute' => 'category', 'max' => 255]),
            'status.string'   => trans('validation.string', ['attribute' => 'status']),
            'status.in'       => trans('validation.in', ['attribute' => 'status']),
            'per_page.integer'=> trans('validation.integer', ['attribute' => 'per_page']),
            'per_page.min'    => trans('validation.min.numeric', ['attribute' => 'per_page', 'min' => 1]),
            'all.boolean'     => trans('validation.boolean', ['attribute' => 'all']),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(
                null,
                $validator->errors(),
                422
            )
        );
    }
}
