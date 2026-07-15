<?php

namespace App\Http\Requests\MenuCategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;
use Illuminate\Validation\Rule;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class UpdateMenuCategoryRequest extends FormRequest
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
        $restaurantId = auth('restaurant')->id();
        $id = $this->route('id');

        return [
            'id'    => ['required', 'integer', 'exists:menu_categories,id'],
            'title' => [
                'required', 
                'string', 
                'max:100',
                Rule::unique('menu_categories', 'title')->where(function ($query) use ($restaurantId) {
                    return $query->where('restaurant_id', $restaurantId);
                })->ignore($id)
            ],
            'icon_name'         => ['required', 'string', 'max:100'],
            'short_description' => ['required', 'string', 'max:100'],
            'visibility'        => ['nullable', 'string', Rule::in(MenuCategoryVisibilityEnum::values())],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => trans('validation.required', ['attribute' => 'title']),
            'title.unique'   => trans('menu_category.title_unique'),
            'icon_name.required' => trans('validation.required', ['attribute' => 'icon_name']),
            'short_description.required' => trans('validation.required', ['attribute' => 'short_description']),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
