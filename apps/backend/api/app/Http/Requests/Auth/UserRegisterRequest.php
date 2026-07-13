<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UserRegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:255',
            ],

            'last_name' => [
                'required',
                'string',
                'max:255'
            ],

            'date_of_birth' => [
                'required',
                'date',
                'before:today',
            ],

            'username' => [
                'required',
                'string',
                'max:50',
                'unique:users,username',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'phone_number' => [
                'required',
                'string',
                'unique:users,phone_number',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

            'gender' => [
                'required',
                'in:male,female',
            ],

            'referrer_code' => [
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => trans('validation.required', ['attribute' => 'first name']),
            'last_name.required'  => trans('validation.required', ['attribute' => 'last name']),

            'username.required' => trans('validation.required', ['attribute' => 'username']),
            'username.unique'   => trans('validation.unique', ['attribute' => 'username']),

            'email.required' => trans('validation.required', ['attribute' => 'email']),
            'email.email'    => trans('validation.email', ['attribute' => 'email']),
            'email.unique'   => trans('validation.unique', ['attribute' => 'email']),

            'phone_number.required' => trans('validation.required', ['attribute' => 'phone number']),
            'phone_number.unique'   => trans('validation.unique', ['attribute' => 'phone number']),

            'password.required'  => trans('validation.required', ['attribute' => 'password']),
            'password.min'       => trans('validation.min.string', [
                'attribute' => 'password',
                'min'       => 8,
            ]),
            'password.confirmed' => trans('validation.confirmed', ['attribute' => 'password']),

            'gender.required' => trans('validation.required', ['attribute' => 'gender']),
            'gender.in'       => trans('validation.in', ['attribute' => 'gender']),

            'referrer_code.string' => trans('validation.string', ['attribute' => 'referrer code']),
        ];
    }
}
