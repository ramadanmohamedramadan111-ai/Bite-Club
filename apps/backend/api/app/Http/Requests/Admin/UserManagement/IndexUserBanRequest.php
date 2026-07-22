<?php

namespace App\Http\Requests\Admin\UserManagement;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class IndexUserBanRequest extends FormRequest
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

        if ($this->has('email') && is_string($this->input('email'))) {
            $data['email'] = trim($this->input('email'));
        }

        if ($this->has('search') && is_string($this->input('search'))) {
            $data['search'] = trim($this->input('search'));
        }

        $this->merge($data);
    }

    public function rules(): array
    {
        return [
            'username' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'search'   => ['sometimes', 'nullable', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.string'  => trans('validation.string', ['attribute' => 'username']),
            'email.string'     => trans('validation.string', ['attribute' => 'email']),
            'search.string'    => trans('validation.string', ['attribute' => 'search']),
            'per_page.integer' => trans('validation.integer', ['attribute' => 'per_page']),
            'per_page.min'     => trans('validation.min.numeric', ['attribute' => 'per_page', 'min' => 1]),
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
