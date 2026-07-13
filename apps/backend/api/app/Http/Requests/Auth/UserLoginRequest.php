<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UserLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'    => trans('validation.required', ['attribute' => 'email']),
            'email.email'       => trans('validation.email', ['attribute' => 'email']),
            'password.required' => trans('validation.required', ['attribute' => 'password']),
        ];
    }
}
