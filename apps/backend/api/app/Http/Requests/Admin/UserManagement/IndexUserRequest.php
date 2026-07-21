<?php

namespace App\Http\Requests\Admin\UserManagement;

use App\Enums\Auth\UserStatusEnum;
use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class IndexUserRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('username') && is_string($this->input('username'))) {
            $data['username'] = trim($this->input('username'));
        }

        if ($this->has('full_name') && is_string($this->input('full_name'))) {
            $data['full_name'] = trim($this->input('full_name'));
        }

        if ($this->has('email') && is_string($this->input('email'))) {
            $data['email'] = trim($this->input('email'));
        }

        if ($this->has('phone_number') && is_string($this->input('phone_number'))) {
            $data['phone_number'] = trim($this->input('phone_number'));
        }

        if ($this->has('status') && is_string($this->input('status'))) {
            $data['status'] = trim(strtolower($this->input('status')));
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        return [
            'username'     => ['sometimes', 'nullable', 'string', 'max:255'],
            'full_name'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'email'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status'       => ['sometimes', 'nullable', 'string', Rule::in(array_map(fn ($case) => $case->value, UserStatusEnum::cases()))],
            'per_page'     => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.string'     => trans('validation.string', ['attribute' => 'username']),
            'full_name.string'    => trans('validation.string', ['attribute' => 'full_name']),
            'email.string'        => trans('validation.string', ['attribute' => 'email']),
            'phone_number.string' => trans('validation.string', ['attribute' => 'phone_number']),
            'status.string'       => trans('validation.string', ['attribute' => 'status']),
            'status.in'           => trans('validation.in', ['attribute' => 'status']),
            'per_page.integer'    => trans('validation.integer', ['attribute' => 'per_page']),
            'per_page.min'        => trans('validation.min.numeric', ['attribute' => 'per_page', 'min' => 1]),
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
