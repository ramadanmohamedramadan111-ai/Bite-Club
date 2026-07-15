<?php

namespace App\Http\Requests\MenuItem;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;
use Illuminate\Validation\Rule;
use App\Enums\MenuItem\MenuItemAvailabilityEnum;

class StoreMenuItemRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'menu_category_id' => ['required', 'integer', 'exists:menu_categories,id'],
            'title'            => ['required', 'string', 'max:150'],
            'description'      => ['required', 'string'],
            'image'            => ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'price'            => ['required', 'numeric', 'min:0'],
            'availability'     => ['nullable', 'string', Rule::in(MenuItemAvailabilityEnum::values())],
        ];
    }

    public function messages(): array
    {
        return [
            'menu_category_id.required' => trans('validation.required', ['attribute' => 'menu_category_id']),
            'menu_category_id.exists'   => trans('validation.exists', ['attribute' => 'menu category']),
            'title.required'            => trans('validation.required', ['attribute' => 'title']),
            'description.required'      => trans('validation.required', ['attribute' => 'description']),
            'image.required'            => trans('validation.required', ['attribute' => 'image']),
            'image.image'               => trans('validation.image', ['attribute' => 'image']),
            'price.required'            => trans('validation.required', ['attribute' => 'price']),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
