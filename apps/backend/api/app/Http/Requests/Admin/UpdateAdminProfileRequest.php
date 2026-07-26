<?php

namespace App\Http\Requests\Admin;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateAdminProfileRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('name') && is_string($this->input('name'))) {
            $data['name'] = trim($this->input('name'));
        }

        if ($this->has('email') && is_string($this->input('email'))) {
            $data['email'] = trim($this->input('email'));
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        $adminId = auth('admin')->id();

        return [
            'name'  => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('admins', 'email')->ignore($adminId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => trans('validation.required', ['attribute' => 'name']),
            'name.string'    => trans('validation.string', ['attribute' => 'name']),
            'name.max'       => trans('validation.max.string', ['attribute' => 'name', 'max' => 255]),
            'email.required' => trans('validation.required', ['attribute' => 'email']),
            'email.email'    => trans('validation.email', ['attribute' => 'email']),
            'email.max'      => trans('validation.max.string', ['attribute' => 'email', 'max' => 255]),
            'email.unique'   => trans('validation.unique', ['attribute' => 'email']),
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
