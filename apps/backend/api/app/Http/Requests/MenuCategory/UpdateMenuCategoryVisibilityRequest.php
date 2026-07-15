<?php

namespace App\Http\Requests\MenuCategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;
use Illuminate\Validation\Rule;
use App\Enums\MenuCategory\MenuCategoryVisibilityEnum;

class UpdateMenuCategoryVisibilityRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'visibility' => ['required', 'string', Rule::in(MenuCategoryVisibilityEnum::values())],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
