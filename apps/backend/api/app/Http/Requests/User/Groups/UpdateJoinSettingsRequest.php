<?php

namespace App\Http\Requests\User\Groups;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class UpdateJoinSettingsRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'allow_join_by_link' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'allow_join_by_link.required' => trans('validation.required', ['attribute' => 'allow_join_by_link']),
            'allow_join_by_link.boolean'  => trans('validation.boolean', ['attribute' => 'allow_join_by_link']),
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
