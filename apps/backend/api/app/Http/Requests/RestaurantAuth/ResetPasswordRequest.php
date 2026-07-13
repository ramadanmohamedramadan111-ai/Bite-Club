<?php

namespace App\Http\Requests\RestaurantAuth;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email', 'exists:restaurants,email'],
            'token'    => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'    => trans('validation.required', ['attribute' => 'email']),
            'email.email'       => trans('validation.email', ['attribute' => 'email']),
            'email.exists'      => trans('restaurant_auth.email_not_found', [], 'en'),
            'token.required'    => trans('validation.required', ['attribute' => 'token']),
            'password.required' => trans('validation.required', ['attribute' => 'password']),
            'password.confirmed'=> trans('validation.confirmed', ['attribute' => 'password']),
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
