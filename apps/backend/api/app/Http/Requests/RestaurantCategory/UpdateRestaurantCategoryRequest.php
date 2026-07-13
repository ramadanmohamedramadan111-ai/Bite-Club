<?php

namespace App\Http\Requests\RestaurantCategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class UpdateRestaurantCategoryRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'id' => $this->route('id'),
        ]);
    }

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'id'   => ['required', 'integer', 'exists:restaurant_categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255', 'unique:restaurant_categories,name,' . $id],
            'slug' => ['sometimes', 'required', 'string', 'max:255', 'unique:restaurant_categories,slug,' . $id],
        ];
    }

    public function messages(): array
    {
        return [
            'id.required'   => trans('validation.required', ['attribute' => 'id']),
            'id.integer'    => trans('validation.integer', ['attribute' => 'id']),
            'id.exists'     => trans('restaurant_category.not_found'),
            'name.required' => trans('validation.required', ['attribute' => 'name']),
            'name.string'   => trans('validation.string', ['attribute' => 'name']),
            'name.max'      => trans('validation.max.string', ['attribute' => 'name', 'max' => 255]),
            'name.unique'   => trans('validation.unique', ['attribute' => 'name']),
            'slug.required' => trans('validation.required', ['attribute' => 'slug']),
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
