<?php

namespace App\Http\Requests\User\Groups;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class UpdateMemberRoleRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:admin,member'],
        ];
    }

    public function messages(): array
    {
        return [
            'role.required' => trans('validation.required', ['attribute' => 'role']),
            'role.string'   => trans('validation.string', ['attribute' => 'role']),
            'role.in'       => trans('validation.in', ['attribute' => 'role']),
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
