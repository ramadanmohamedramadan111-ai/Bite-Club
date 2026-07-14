<?php

namespace App\Http\Requests\RestaurantSetting;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Traits\ApiResponseTrait;

class StoreRestaurantSettingRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'restaurant_id'      => ['required', 'integer', 'exists:restaurants,id', 'unique:restaurant_settings,restaurant_id'],
            'deposit_threshold'  => ['required', 'numeric', 'min:250'],
            'deposit_percentage' => ['required', 'numeric', 'min:30', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'restaurant_id.required'      => trans('validation.required', ['attribute' => 'restaurant_id']),
            'restaurant_id.integer'       => trans('validation.integer', ['attribute' => 'restaurant_id']),
            'restaurant_id.exists'        => trans('validation.exists', ['attribute' => 'restaurant_id']),
            'restaurant_id.unique'        => trans('validation.unique', ['attribute' => 'restaurant_id']),
            'deposit_threshold.required'  => trans('validation.required', ['attribute' => 'deposit_threshold']),
            'deposit_threshold.numeric'   => trans('validation.numeric', ['attribute' => 'deposit_threshold']),
            'deposit_threshold.min'       => trans('validation.min.numeric', ['attribute' => 'deposit_threshold', 'min' => 250]),
            'deposit_percentage.required' => trans('validation.required', ['attribute' => 'deposit_percentage']),
            'deposit_percentage.numeric'  => trans('validation.numeric', ['attribute' => 'deposit_percentage']),
            'deposit_percentage.min'      => trans('validation.min.numeric', ['attribute' => 'deposit_percentage', 'min' => 30]),
            'deposit_percentage.max'      => trans('validation.max.numeric', ['attribute' => 'deposit_percentage', 'max' => 100]),
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
