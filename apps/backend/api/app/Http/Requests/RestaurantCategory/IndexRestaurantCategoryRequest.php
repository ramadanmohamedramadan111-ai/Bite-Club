<?php

namespace App\Http\Requests\RestaurantCategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class IndexRestaurantCategoryRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('all')) {
            $this->merge([
                'all' => filter_var($this->input('all'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1'],
            'all'      => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'per_page.integer' => trans('validation.integer', ['attribute' => 'per_page']),
            'per_page.min'     => trans('validation.min.numeric', ['attribute' => 'per_page', 'min' => 1]),
            'all.boolean'      => trans('validation.boolean', ['attribute' => 'all']),
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
