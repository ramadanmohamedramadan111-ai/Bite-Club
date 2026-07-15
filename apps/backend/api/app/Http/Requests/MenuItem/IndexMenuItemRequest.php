<?php

namespace App\Http\Requests\MenuItem;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;
use Illuminate\Validation\Rule;

class IndexMenuItemRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('all')) {
            $this->merge([
                'all' => filter_var($this->all, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'per_page'         => ['nullable', 'integer', 'min:1', 'max:100'],
            'all'              => ['nullable', 'boolean'],
            'title'            => ['nullable', 'string', 'max:150'],
            'menu_category_id' => ['nullable', 'integer', 'exists:menu_categories,id'],
            'sort_by'          => ['nullable', 'string', Rule::in(['id', 'price', 'created_at', 'title'])],
            'sort_dir'         => ['nullable', 'string', Rule::in(['asc', 'desc'])],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
