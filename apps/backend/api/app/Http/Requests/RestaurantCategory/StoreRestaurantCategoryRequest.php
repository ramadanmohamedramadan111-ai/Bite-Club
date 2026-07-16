<?php

namespace App\Http\Requests\RestaurantCategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class StoreRestaurantCategoryRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255', 'unique:restaurant_categories,name'],
            'slug'  => ['nullable', 'string', 'max:255', 'unique:restaurant_categories,slug'],
            'image' => ['nullable', 'image', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => trans('validation.required', ['attribute' => 'name']),
            'name.string'   => trans('validation.string', ['attribute' => 'name']),
            'name.max'      => trans('validation.max.string', ['attribute' => 'name', 'max' => 255]),
            'name.unique'   => trans('validation.unique', ['attribute' => 'name']),
            'slug.string'   => trans('validation.string', ['attribute' => 'slug']),
            'slug.max'      => trans('validation.max.string', ['attribute' => 'slug', 'max' => 255]),
            'slug.unique'   => trans('validation.unique', ['attribute' => 'slug']),
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
