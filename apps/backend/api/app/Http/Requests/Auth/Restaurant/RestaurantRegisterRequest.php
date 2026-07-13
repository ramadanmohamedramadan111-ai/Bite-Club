<?php

namespace App\Http\Requests\Auth\Restaurant;

use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RestaurantRegisterRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'email', 'unique:restaurants,email'],
            'password'    => ['required', 'string', 'min:8', 'confirmed'],
            'phone_number'=> ['required', 'string', 'unique:restaurants,phone_number'],
            'address'     => ['required', 'string', 'max:500'],
            'category_id' => ['nullable', 'integer', 'exists:restaurant_categories,id'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => trans('validation.required', ['attribute' => 'name']),
            'email.required'        => trans('validation.required', ['attribute' => 'email']),
            'email.email'           => trans('validation.email', ['attribute' => 'email']),
            'email.unique'          => trans('restaurant_auth.email_taken'),
            'password.required'     => trans('validation.required', ['attribute' => 'password']),
            'password.min'          => trans('validation.min.string', ['attribute' => 'password', 'min' => 8]),
            'password.confirmed'    => trans('validation.confirmed', ['attribute' => 'password']),
            'phone_number.required' => trans('validation.required', ['attribute' => 'phone number']),
            'phone_number.unique'   => trans('restaurant_auth.phone_taken'),
            'address.required'      => trans('validation.required', ['attribute' => 'address']),
            'category_id.exists'    => trans('validation.exists', ['attribute' => 'category']),
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            $this->errorResponse(null, $validator->errors(), 422)
        );
    }
}
